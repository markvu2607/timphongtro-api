import { validateEnvironment } from 'src/common/utils';
import * as process from 'node:process';

type AppConfig = {
  app: {
    environment: 'development' | 'production' | 'test';
    port: number;
    verificationTokenTTL: string;
  };
  web: {
    url: string;
  };
  hashing: {
    bcrypt: {
      rounds: number;
    };
  };
  jwt: {
    secret: string;
    accessTokenTtl: string;
  };
  database: {
    host: string;
    port: number;
    name: string;
    user: string;
    password: string;
  };
  mail: {
    host: string;
    port: number;
    from: string;
  };
  aws: {
    region: string;
    accessKeyId: string;
    secretAccessKey: string;
    s3: {
      bucketName: string;
    };
  };
};

export default (): AppConfig => ({
  app: {
    environment: validateEnvironment(process.env.ENVIRONMENT || 'development'),
    port: parseInt(process.env.PORT || '9999', 10),
    verificationTokenTTL: process.env.VERIFICATION_TOKEN_TTL,
  },
  web: {
    url: process.env.WEB_URL || 'http://localhost:3000',
  },
  hashing: {
    bcrypt: {
      rounds: parseInt(process.env.BCRYPT_ROUNDS || '10', 10),
    },
  },
  jwt: {
    secret: process.env.JWT_SECRET,
    accessTokenTtl: process.env.JWT_ACCESS_TOKEN_TTL,
  },
  database: {
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT || '5432', 10),
    name: process.env.DB_NAME,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
  },
  mail: {
    host: process.env.MAIL_HOST || 'localhost',
    port: parseInt(process.env.MAIL_PORT || '1025', 10),
    from: process.env.MAIL_FROM || '"Admin" <test@admin.com>',
  },
  aws: {
    region: process.env.AWS_REGION,
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
    s3: {
      bucketName: process.env.AWS_S3_BUCKET_NAME,
    },
  },
});
