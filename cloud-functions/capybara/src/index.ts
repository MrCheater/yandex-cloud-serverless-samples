export async function handler(event: any, context: any) {
  // return {
  //   statusCode: 200,
  //   body: "QQQ",
  // };

  return {
    statusCode: 302,
    multiValueHeaders: {
      Location: [
        "https://upload.wikimedia.org/wikipedia/commons/thumb/e/ec/Capybara_%28Hydrochoerus_hydrochaeris%29.JPG/1280px-Capybara_%28Hydrochoerus_hydrochaeris%29.JPG",
      ],
    },
    body: "",
  };
}
