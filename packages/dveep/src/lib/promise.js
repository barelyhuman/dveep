export const nopanic = async fn => {
  try {
    return {
      data: await fn(),
      err: undefined,
    }
  } catch (err) {
    console.error(err)
    return {
      data: undefined,
      err: err,
    }
  }
}
