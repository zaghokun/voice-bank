"""
VoiceBank - Model Loader
Load trained .keras model with custom KustomAttention layer.
"""

import tensorflow as tf
import numpy as np


@tf.keras.utils.register_keras_serializable(package="Custom Layers")
class KustomAttention(tf.keras.layers.Layer):
    """Custom Attention Layer — memberi bobot pada fonem kunci lintas dialek."""

    def __init__(self, **kwargs):
        super(KustomAttention, self).__init__(**kwargs)

    def build(self, input_shape):
        self.W = self.add_weight(
            name="att_weight", shape=(input_shape[-1], 1),
            initializer="glorot_uniform", trainable=True
        )
        self.b = self.add_weight(
            name="att_bias", shape=(input_shape[1], 1),
            initializer="zeros", trainable=True
        )
        super(KustomAttention, self).build(input_shape)

    def call(self, x):
        e = tf.tanh(tf.matmul(x, self.W) + self.b)
        alignment_scores = tf.nn.softmax(e, axis=1)
        context_vector = x * alignment_scores
        return tf.reduce_sum(context_vector, axis=1)


# Label mapping sesuai pipeline (sorted alphabetically)
LABEL_CLASSES = ["BANTUAN", "CEK_SALDO", "RIWAYAT", "TABUNG", "TRANSFER"]


def load_model(model_path: str) -> tf.keras.Model:
    """Load model .keras dengan custom objects."""
    model = tf.keras.models.load_model(
        model_path,
        custom_objects={"KustomAttention": KustomAttention}
    )
    return model
