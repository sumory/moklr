## Moklr

moklr定位于http请求代码生成，自动化测试，API status服务等test/development辅助功能，此外还可能集成文档服务，目前仍在持续开发中。


### Demo

[heroku moklr](https://still-peak-9538.herokuapp.com),  账号：test/123456

### Features

- [X] postman替代品，支持postaman数据(collection级别)直接导入
- [X] http请求代码生成，支持常见的多种语言(js/java/go/python/shell/ruby等等)
- [X] API status检查(需[runbot](https://github.com/sumory/runbot)支持)
- [ ] 批量测试case
- [ ] 测试文档和API文档生成


### Usage

1. 依赖于mongodb，需提前安装
2. 运行

	```
	git clone https://github.com/sumory/moklr.git
	cd moklr
	npm install .

	#根据具体情况修改config配置,配置位于config目录下

	#选择config目录下的test.js这个配置启动
	NODE_ENV=test node index.js

	#访问http://localhost:8001
	```

### Screenshots

![](assets/postman.png)
![](assets/status.png)

