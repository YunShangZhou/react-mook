import Axios, { AxiosRequestConfig } from 'axios';
// import { message, notification } from 'antd'
import { responseProps } from 'src/types';

// export const baseURL = 'http://localhost:8081'
export const baseURL = process.env.NODE_ENV === 'development' ? '' : '线上地址';
// const [api, textHolder] = notification.useNotification()
// const [msg, msgTextHolder] = message.useMessage()

const instance = Axios.create({
  baseURL,
  timeout: 3000,
});

instance.interceptors.request.use(
  (config) =>
  // const token = useToken()
  // config.headers.Authorization = token
    config,

  (error) => {
    // msg.error(error)
    Promise.reject(error);
  },
);

instance.interceptors.response.use((res) => {
  const { data = {} } = res;
  if (data) {
    const { code, message = 'Error' } = data;

    // temp
    // if (code != 0) {
    if (false && code !== 0) {
      // api.error({
      //     message: "Error",
      //     description: message
      // })
      return Promise.reject(new Error(message));
    }
  }
  return Promise.resolve(data);
}, (error) => {
  console.error(error);
  return Promise.reject(error);
});

function request<T = any>(config: AxiosRequestConfig): Promise<responseProps<T>> {
  return new Promise((resolve, reject) => {
    instance.request(config).then((res) => {
      resolve(res);
    }).catch((err) => {
      reject(err);
    });
  });
}

// const methodsArr = ['get', 'post', 'patch', 'delete', 'put'];
export const get = function (url: string, params = {}) { return request({ method: "get", url, params }); };
export const post = function (url: string, params = {}) { return request({ method: "post", url, params }); };

export default request;
