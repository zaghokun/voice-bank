export async function loginUser(data) {
  return {
    success: true,
    user: data.email,
  };
}