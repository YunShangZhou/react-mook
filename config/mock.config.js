const path = require('path');
const fs = require('fs');

const response = (res, message, type = 'json') => {
  // 做三件事: 定义类型 编写 结束编程
  res.type(type);
  res.write(message);
  res.end();
};

const mock = (res, filePath) => {
  fs.readFile(filePath, 'utf8', (error, content) => {
    if (error) {
      response(res, error.message, 'html');
    }
    response(res, content);
  });
};

const mockMiddleware = (config) => (req, res, next) => {
  const { projectDir, mockDir } = config;
  const filePath = path.resolve(projectDir, `./${mockDir}${req.path}.json`);

  return fs.stat(filePath, (error) => {
    if (error) {
      next();
    } else {
      mock(res, filePath);
    }
  });
};

module.exports = mockMiddleware;
