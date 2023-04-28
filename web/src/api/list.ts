import axios from 'axios'

export interface Item {
  title: string;
  roomname: string;
  from: string;
  to: string;
  user: string;
  approvalStatus: string;
  status: number;
  approvalTime: string;
}

interface ResData<T> {
  status: boolean;
  info: string;
  data: T;
}

export default async (date: string) => {
  return axios({
    url: '/api/list',
    params: {
      date: date
    }
  }).then((res): ResData<Item[]> => res.data)
}
