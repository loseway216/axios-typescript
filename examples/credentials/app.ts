import axios from '../../src/index'

document.cookie = 'a=b'

// test same origin
axios.get('/more/get').then(res => {
  console.log(res)
})

// test CORS
axios
  .post(
    'http://127.0.0.1:8088/more/server2',
    {},
    {
      withCredentials: true
    }
  )
  .then(res => {
    console.log(res)
  })
