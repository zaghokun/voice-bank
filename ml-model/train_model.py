import os
import numpy as np
import tensorflow as tf
from keras import layers, Model

# =========================
# CONFIG
# =========================

DATA_DIR = "data"
MODEL_PATH = "model_intent_classification_balanced.keras"

LABEL_CLASSES = ["BANTUAN", "CEK_SALDO", "RIWAYAT", "TABUNG", "TRANSFER"]
NUM_CLASSES = len(LABEL_CLASSES)

# =========================
# LOAD BALANCED DATASET
# =========================

train = np.load(os.path.join(DATA_DIR, "train_mfcc_final_v2.npz"))
dev = np.load(os.path.join(DATA_DIR, "dev_mfcc_final_v2.npz"))
test = np.load(os.path.join(DATA_DIR, "test_mfcc_final_v2.npz"))

X_train, y_train = train["features"], train["labels"]
X_dev, y_dev = dev["features"], dev["labels"]
X_test, y_test = test["features"], test["labels"]

print("Train:", X_train.shape, y_train.shape)
print("Dev  :", X_dev.shape, y_dev.shape)
print("Test :", X_test.shape, y_test.shape)

print("\nDistribusi label train:")
for label_idx, count in zip(*np.unique(y_train, return_counts=True)):
    print(label_idx, LABEL_CLASSES[int(label_idx)], count)

# =========================
# CUSTOM ATTENTION LAYER
# =========================

@tf.keras.utils.register_keras_serializable(package="Custom Layers")
class KustomAttention(tf.keras.layers.Layer):
    def build(self, input_shape):
        self.W = self.add_weight(
            name="att_weight",
            shape=(input_shape[-1], 1),
            initializer="glorot_uniform",
            trainable=True,
        )
        self.b = self.add_weight(
            name="att_bias",
            shape=(input_shape[1], 1),
            initializer="zeros",
            trainable=True,
        )

    def call(self, x):
        e = tf.tanh(tf.matmul(x, self.W) + self.b)
        alignment_scores = tf.nn.softmax(e, axis=1)
        context_vector = x * alignment_scores
        return tf.reduce_sum(context_vector, axis=1)

# =========================
# MODEL CNN + BiLSTM + ATTENTION
# =========================

inputs = layers.Input(shape=X_train.shape[1:])

x = layers.Conv1D(128, 3, activation="relu", padding="same")(inputs)
x = layers.BatchNormalization()(x)
x = layers.MaxPooling1D(2)(x)
x = layers.Dropout(0.25)(x)

x = layers.Conv1D(256, 3, activation="relu", padding="same")(x)
x = layers.BatchNormalization()(x)
x = layers.MaxPooling1D(2)(x)
x = layers.Dropout(0.25)(x)

x = layers.Bidirectional(
    layers.LSTM(128, return_sequences=True)
)(x)

x = KustomAttention()(x)

x = layers.Dense(128, activation="relu")(x)
x = layers.Dropout(0.3)(x)

outputs = layers.Dense(NUM_CLASSES, activation="softmax")(x)

model = Model(inputs, outputs)

model.compile(
    optimizer=tf.keras.optimizers.Adam(learning_rate=0.0005),
    loss="sparse_categorical_crossentropy",
    metrics=["accuracy"],
)

model.summary()

# =========================
# TRAINING
# =========================

callbacks = [
    tf.keras.callbacks.EarlyStopping(
        monitor="val_accuracy",
        patience=10,
        mode="max",
        restore_best_weights=True,
    ),
    tf.keras.callbacks.ModelCheckpoint(
        MODEL_PATH,
        monitor="val_accuracy",
        mode="max",
        save_best_only=True,
    ),
    tf.keras.callbacks.ReduceLROnPlateau(
        monitor="val_loss",
        factor=0.5,
        patience=4,
        min_lr=1e-6,
        verbose=1,
    ),
]

history = model.fit(
    X_train,
    y_train,
    validation_data=(X_dev, y_dev),
    epochs=60,
    batch_size=32,
    callbacks=callbacks,
)

# =========================
# EVALUATION
# =========================

test_loss, test_acc = model.evaluate(X_test, y_test)

print(f"\nTest loss     : {test_loss:.4f}")
print(f"Test accuracy : {test_acc:.4f}")

model.save(MODEL_PATH)

print(f"\n✅ Model balanced berhasil disimpan ke: {MODEL_PATH}")