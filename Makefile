run:
	docker run --interactive --tty --rm --net=host -v /home/goern/Source/webapps:/project -v /home/goern/Source/webapps/root:/root --name nodejs-base -v /home/goern/Source/webapps/home:/home/yeoman -e NAME=nodejs-base -e IMAGE=nodejs-base -p 3001:3001 nodejs-base

image:
	docker build --rm --tag nodejs-base .
