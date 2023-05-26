export const nopanic = async fn => {
  try {
    return {
      data: await fn(),
      err: undefined,
    }
  } catch (err) {
    return {
      data: undefined,
      err: err,
    }
  }
}
