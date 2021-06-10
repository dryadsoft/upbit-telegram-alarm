import axios from "axios";

const Axios = axios.create({ timeout: 300 });

Axios.interceptors.request.use(
  (request) => {
    console.log(request.url);
    return request;
  },
  (err) => {
    console.log(err);
    return Promise.reject("err");
  }
);

Axios.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response) {
      console.log("response err");
      if (error.response.data) {
        const { error_code, description } = error.response.data;
        console.log(`${error_code}: ${description}`);
      }
    } else if (error.request) {
      console.log("request err");
      // console.dir(error.request);
      console.log(error.request._currentUrl);
      console.log(JSON.stringify(error.request._timeout));
    }
    // return "er";
    return Promise.reject("err");
  }
);

export default Axios;
