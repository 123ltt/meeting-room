import Request from 'request'

// Request.debug = true
const j = Request.jar()
const request = Request.defaults({ jar: j })

interface ZHLoginRes {
  ticket: string;
  username: string;
  access_token: string;
  expires_in: number;
}

interface ZHResData<T> {
  ack: number;
  data: T;
}

export default async function login(): Promise<string> {
  const { U: username, P: password } = process.env
  if (!(username && password)) return Promise.reject(new Error('未配置账号密码'))

  return new Promise((resolve, reject) => {
    request({
      url: 'http://izehui.com/server/api/login',
      method: 'post',
      qs: {
        captcha: "",
        captcha_key: "",
        jump: 0,
        password,
        username,
        zt_id: 1
      }
    }, (err, res, body) => {
      if (err) return reject(err)
      const data: ZHResData<ZHLoginRes> = JSON.parse(body)
      if (data.ack === 1) {
        const { ticket, username } = data.data
        request({
          url: 'http://izehui.com/server/link?url=http%3A%2F%2F202.104.114.238%3A8081%2Foa%2Foa_room_admin.php&tid=8210'
        }, (err, res, body) => {
          if (err) return reject(err)
          const domain = 'http://202.104.114.238:8081'
          request({
            url: domain + '/login_new.php',
            qs: { ticket, username }
          }, (err) => {
            if (err) return reject(err)
            resolve(j.getCookieString(domain))
          })
        })
      }
    })
  })
}
