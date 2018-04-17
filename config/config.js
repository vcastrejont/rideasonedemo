var _ = require('lodash');
var mongoUri = process.env.MONGODB_URI || 'mongodb://localhost/carpooling';

var defaults = {
  db: {
    'secret': '^hr%ps}79TV2D&KJ',
    'database': mongoUri
  },
  mailer: {
    'service' : 'Mailgun',
    transportUrl:'smtps://postmaster@sandbox2a6fe67649af4a019f16d6a46c7a60c1.mailgun.org:2fd912caedf6f773d61c777ab375f322@smtp.mailgun.org',
    transport: {
      host: 'smtp.mailgun.org',
      secureConnection: false,
      auth: {
        'user'  : 'postmaster@sandbox2a6fe67649af4a019f16d6a46c7a60c1.mailgun.org',
        'pass'  : '2fd912caedf6f773d61c777ab375f322',
      },
    },
    'from'  : 'carpooling@nearsoft.com',
    'default' : 'vcastrejon@nearsoft.com'
  },
  jwtSecret: process.env.JWT_SECRET || 'weShouldAddAKeyToEnvironmentVariablesToMakeThisShitSecure',
  issuer: 'one.rideas.api',
  twitter: {
    key: 'jq5f1KwBuSUimnn78MskHlL5i',
    secret: 'aL1qpqo4g3oownskIzwz3XoWHQl4FMlvHeqop6bfX2oIYvv6pp'
  },
  facebook: {
    key: '1515943715378851',
    secret: 'e4fa56b2a2be6dbfa96994baf9660643'
  },
  google: {
    key: '764821343773-cjpf8lnubnnmjrupiu8oen4vsacgcq9n.apps.googleusercontent.com',
    secret: '5sAsJshpCHf_s4Tzk17_7nTK'
  },
  firebase: {
    apiKey: "AIzaSyBPA6TkgY1Y589UXOmUWz8rUNcYntqmnns",
    authDomain: "vocal-etching-118719.firebaseapp.com",
    storageBucket: "vocal-etching-118719.appspot.com",
    databaseURL: "https://vocal-etching-118719.firebaseio.com",
    messagingSenderId: "764821343773",
    serviceAccount: {
      "type": "service_account",
      "project_id": "vocal-etching-118719",
      "private_key_id": "f83f84c26c6f52906227b534a0cc0fe8c61190c3",
      "private_key": "-----BEGIN PRIVATE KEY-----\nMIIEvgIBADANBgkqhkiG9w0BAQEFAASCBKgwggSkAgEAAoIBAQDU0h0hc8cPKadn\nkhD/Gn64oga2zacJrncerV3igrr0DOt/U4rH/DWYyWM8CJTckmuGETliOPyDneSy\nzi0tnM6QFEeYtsCkx1yR6kX+NUyE8Jz2jB9UsyWTBGFrU4SBw5PMS5sY7OM971kM\nBFyiOG8bEPgk47kwbQZXhnLWXuGPl4CmnjGcrrp9Lomv87UOMp0o+EKlGQE2Cp6l\nZFoJqZEz9cRF7N9DRmlDvyznwxWq3RVPO83dmqmYvhWIE4wPhqutO06nW3viGzLe\n/n5KrWbDf6HRE4B1PdnUiv3G6naFQtdsFsxxrUxvFAxUKMtCdDsxepjfVvzvo0vP\nUuEKXWkLAgMBAAECggEBAK3obOmTJI0darDVyZHM4tSZgocLEn501N56qQeZ8I/R\npvdLG1NEo7+Qgcji8lI0TC0oEg5TpvUep2390Sk+xAU0rTT70fxU9S4/lKagg0D3\nJizKYCfkpMW4hKshelxXp4UAG2OI4EESP1/0iIX/O7uQaFYsyH3r+Yy4T0siCYw9\nsdvMUWi1nJsBY3ay1TngA8NslGsR5pgMA/nBfXuslNxpAjQJJ6KQJF9Sqf/UG0sp\naO0fGtLVNFYi78CMfGDJKkq/wpn3GrK1yKzbswwQtAt30uMkaq0BXo+zSPAOn/Ek\nj/ANsK2jXSllloKdoUccKWG5PYPqV0LFpCWj4eEircECgYEA7QKt8iuH4lQougXT\nnXCY+ru5YNNihNFwoQ9pkKVO+pjUBmdUfoazBE7cqOvFoz1pAk1eR1WZofnj3N1R\nsxTFXtCVaNyIHQi1n+apurISFSzmedOVvrnCXTCgl/D8tWtjZiEf6ckkn5RMEWEY\nsDqh93ipNiJg54RBPpkZqi4jZ3sCgYEA5d9HgA5eTFhp8e3Dmtk0HSW0BHVWmxeA\n0Vw/JcJrM6kDogZGLcL97AKNIm1d6BAQSp4rO6nqLyzbb6HppK2EuFmyycgQaSgA\nHK9m+iYt0Bdb5CUJW/bVWPmHtjuKCfPn6G6gas/TvXA3hbzJoGK5h4GLx51Jx5x7\nLAw0iC+jh7ECgYArrA65TOQhBDjs7h3sKM9HhEfIW6sPpjgGtXxSNuOysW6AL5IW\nLmPWK2HljmxAhBRRZEg3BMLmYdFm5TEkunMT4YNmaxx5nR06dZpY2G8Uj814LVCu\ncDQsT8WHudQW6c7LBteGkJW7AexyV13hOyyVGRq06ujIQEp1amicPxwu+QKBgEAO\ny6cE2gRecw+nGWZSdvJUamj/peXMU+qD0VkdZ7BavhdttirUdtxJDbl1TsD3kQKq\nNxQGUqtYzcG7Fhf8/so8vNT8Oo6DRhy4SHMXJpchm0rlg0ksbOHBj68ZwmrpnEuq\nYGvDhJb66Y4MQQe/20HGuQQkccX9dlmdARqeY+zRAoGBAOhLGFG5Gr9J8GoGcyxA\nf313WeYfQ+Lvdia4wD5XL9xxT5JkjbUPdgTYRIVAHw2zyebrLQB+fhpvaQqOsgIq\npdk5+bCu9I5CM9tpNn2JEy/75M5CsJAeB8hcPa1DANHGmZt05jNj8wlv18FEiiQL\nwkmP3qJ4kwmKHHVlU/7oOGA+\n-----END PRIVATE KEY-----\n",
        "client_email": "rideasone-server@vocal-etching-118719.iam.gserviceaccount.com",
        "client_id": "104923650109992333949",
        "auth_uri": "https://accounts.google.com/o/oauth2/auth",
        "token_uri": "https://accounts.google.com/o/oauth2/token",
        "auth_provider_x509_cert_url": "https://www.googleapis.com/oauth2/v1/certs",
        "client_x509_cert_url": "https://www.googleapis.com/robot/v1/metadata/x509/rideasone-server%40vocal-etching-118719.iam.gserviceaccount.com"
    },
    databaseAuthVariableOverride: {
      uid: "rideasone-server"
    }
  }
};

var overrides = {
  test: {
    db: {
      database: 'mongodb://localhost/carpooling-test'
    }
  },
  production: {
    firebase: {
      apiKey: "AIzaSyBPA6TkgY1Y589UXOmUWz8rUNcYntqmnns",
      authDomain: "vocal-etching-118719.firebaseapp.com",
      storageBucket: "vocal-etching-118719.appspot.com",
      databaseURL: "https://vocal-etching-118719.firebaseio.com",
      serviceAccount: {
        type: "service_account",
        project_id: "vocal-etching-118719",
        private_key_id: "242fdc403e17c4a13029bc9518510774b19ce786",
        private_key: "-----BEGIN PRIVATE KEY-----\nMIIEvQIBADANBgkqhkiG9w0BAQEFAASCBKcwggSjAgEAAoIBAQCdO81P5CD7VEfy\n1e2ex05yXVAJuM5lW9o3MOSDrbYD2pujcSYSjdQkhZxtKF3FK83LFzm0TNB9pfJq\nn4pkCvYgrfc/Ukc1BgXfJhXWBCvnj6ehIU1hPBnTNyls91gd0sgFWXR8qle58jAW\nR0BSKDgemKAGx8cqeNNCL4Wqh1KwTki7nTFCKtxKYooQkLX2wVctFABqeyLiU8az\nQGkhtT7mOTleRnEkrgo2Y4bE6H/mvXxpl2JORqZpcIAEOJyCWemM/5vJ0FC6r5cc\nPzCEVN2BANJbXPCFBCFrG7sRA/g+EomjDyk5x0kgywWiz1kG6zeNNoFv6wRLZqpP\n9UNeCbppAgMBAAECggEAKWKuPdMMI1shvPc2Hk7ThSKuiICOQvuUSmaiH06/0+/c\ne36yyLtwFVTdwZWYaOeIuWYZmC2Hyyq8zffEU2TXN+7SX2Zmu7wkG4JIyRY8AC09\nsBm15lwNaBzi2H2aQe9TGqVbFd04TgdDRPnoIjfX3aXKqT44XCOFZ6xegG4yA5mN\nr5MRMXS9Pfk+XtMlkE4rQYLMClyTkTzaH04uH5vhM7Um+/gCSfmHVs97J9xSIY4U\nbSPY0i6Z208Rsff3gn3PGj5pqK+5zfWGtEKHYvSz7WJ8LV4QeXIkES1btEKuk4uv\n6Tt9KOBbdrfMu/H/M2Yy6BujT1XWbs37jLdW44H6KQKBgQDRnsd4kx0z5S9cu/dI\nDq81t14k56W4loUulrAIwIY698V1140cHHVxqIufORbigfTGjZ8senxlUZ4yyxlB\nWtQOAptM24+WWJmGjZBlWtfllx5ocSa5pcEUh0Msl4yFoIF9Pxrm3areRkRRWWwA\nW6nv5mpmDXlri201K5aN1QxEJwKBgQDABcLr/qjC3D5rzuwstITEDtWurOH4re08\nEWY82rpbOtijx8zMlouBbWtcaSEZ4Nkf1SOLmv0oKYcD7MmdbPUMmk7hRaxJCRUT\nSovVnhMNjMS9M9FFZLqdAI5eyFLePGqPXBj4D/xqgtvltadylu6sNO6qG1cf4PGt\nBXVry2dW7wKBgCNc1enRZ6vJjiPm0eCmGYjGVmuDaMGrIuypHyla0UpBYl5u7q8/\nXdC+zk8eIm4z3kdgvOmUAEhXbIjFGo2b9QooBmsA30hNyhiY6TMwEBv7UnXsIMxQ\n2jHMX9i1+E7StQWcD73Cx4CX+g5/N2kYDaMbC/gLbeBmtRWzNMLYnikhAoGAVeX9\n5V4dFlY54jZFdlYmkiHkuugBiiIb3uQVrSFXfhob8WAeoGKz82kEPumUciQgXNoW\ntYvWtZGmIT5ajn7APCwHH0TwphdXAzM0zJGTCluvYsf8VKOTy0oFZicM0veJ36me\nTdGw4+C4B9E0H9Ge4RAot5XVaqBQ3Ep11Yu/JacCgYEAgr3f1ehnT2wA/UIOs5Xv\nBuinnE5X1ru2+c0PmUp9wf2BOfWxCaKq4yNdHlxcfC6ivp8DtmWjb1aKZFPzPvjq\nFhIYC3y1uEMpNG/hk74CoAvXE6ZaUDkcGu9ae4XAy2j9PbZT9LefG6PgMswzCPd9\ns4zvCY+p7t7oR86CpuKS+GM=\n-----END PRIVATE KEY-----\n",
        client_email: "rideasone-server@vocal-etching-118719.iam.gserviceaccount.com",
        client_id: "109760018379562126322",
        auth_uri: "https://accounts.google.com/o/oauth2/auth",
        token_uri: "https://accounts.google.com/o/oauth2/token",
        auth_provider_x509_cert_url: "https://www.googleapis.com/oauth2/v1/certs",
        client_x509_cert_url: "https://www.googleapis.com/robot/v1/metadata/x509/rideasone-server%40vocal-etching-118719.iam.gserviceaccount.com"
      },
      databaseAuthVariableOverride: {
        uid: "rideAsOne-service"
      }
    }

  }
};

module.exports = _.merge(defaults, overrides[process.env.NODE_ENV]);
