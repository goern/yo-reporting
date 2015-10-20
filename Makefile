run:
	docker run --interactive --tty --rm --net=host -v /home/goern/Source/yo-reporting:/project -v /home/goern/Source/yo-reporting/root:/root --name nodejs-base -v /home/goern/Source/yo-reporting/home:/home/yeoman -e NAME=nodejs-base -e IMAGE=nodejs-base -p 3001:3001 -p 35729:35729 -p 9000:9000 nodejs-base

image:
	cd containerized && docker build --rm --tag nodejs-base .
