FROM fedora:22

RUN dnf install sudo make gcc-c++ git -y --setopt=tsflags=nodocs && \
    dnf install https://rpm.nodesource.com/pub/fc/22/x86_64/nodejs-0.10.40-1nodesource.fc22.x86_64.rpm -y && \
    npm install --global npm && \
    npm install --global bower grunt grunt-cli gulp yo generator-angular jshint

RUN adduser --create-home yeoman && \
    echo "yeoman ALL=(ALL) NOPASSWD:ALL" >> /etc/sudoers

VOLUME [ "/project", "/root", "/home/yeoman" ]
WORKDIR "/project"

ENV HOME /home/yeoman
USER yeoman

EXPOSE 3001 9000

CMD "/bin/bash"
LABEL RUN="docker run --interactive --tty --rm --net=host -v `pwd`:/project -v `pwd`/root:/root -v `pwd`/home:/home/yeoman IMAGE"
