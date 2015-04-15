DevOps Milestone - Deployment
===================
Team Members:

 - Nikhil Katre (nkatre@ncsu.edu)
 - Pengyu Li (pli5@ncsu.edu)
 
Submission: **Milestone#Deploy** <br>
Link To Sample Repository Used: [WebGoat](https://github.com/nkatre/WebGoat) <br>
Submission Files:
>  - README.md

Public IP Addresses
-------------
All servers are hosted in AWS using EC2 service

 1. Master = 52.4.40.18
 2. Canary 1 (Blue) = 52.5.33.235
 3. Canary 2 (Green) = 52.5.15.126

Diagram
![ProjectPlan](https://github.com/nkatre/Milestone---Deploy/blob/master/outputImages/diagram1.png)


Installations and AWS Settings
-------------
Install the following **ON ALL THREE INSTANCES (master, canary1 and canary2)** to achieve this Milestone
 1.  Download and install [salt](http://docs.saltstack.com/en/latest/topics/installation/)
 2.  Download and Install [git](http://git-scm.com/book/en/v2/Getting-Started-Installing-Git)
 3. ON ALL THREE INSTANCES (master, canary1 and canary2) allow **all traffic** option selected from security group in AWS

Make canary1 and canary2 remote repositories to master
-------------
The following steps should be followed to make canary1 and canary2 as remote repository of master

-- Steps for Master
 1. `ssh` to master using `ssh -i Nikhil.pem ubuntu@52.4.40.18` where `Nikhil.pem` is the AWS key file attached with this submission
 2. Create a folder `Proj@Master` using `mkdir` 
 2. Inside this folder initialize a bare repository using `git init --bare`
 3. Clone [WebGoat](https://github.com/nkatre/WebGoat) repository inside this folder
 4. Transfer the key file Nikhil.pem to master from local using the command :

    scp -i Nikhil.pem Nikhil.pem ubuntu@52.4.40.18
 5. Generate ssh key at master and bind AWS key (Nikhil.pem) with this ssh key as follows

    ssh-keygen 

    cat ~/.ssh/id_rsa.pub | ssh -i Nikhil.pem ubuntu@52.5.33.235 "cat >> .ssh/authorized_keys"

    cat ~/.ssh/id_rsa.pub | ssh -i Nikhil.pem ubuntu@52.5.15.126 "cat >> .ssh/authorized_keys"
6. Bind this key with ssh command at master for authentication

     ssh-add Nikhil.pem

7. Setup SSH at MASTER

```bash
$ ssh-add Nikhil.pem
```

8. Add git remote

```bash
$ git remote add blue ssh://ubuntu@52.5.33.235/blue.git
$ git remote add green ssh://ubuntu@52.5.15.126/green.git
```
# Setup remote git repo on canary1

## Create a bare repository

```bash
$ mkdir blue.git
$ cd blue.git
$ git init --bare
```

## Set GIT_WORK_TREE

```bash
$ mkdir /home/ubuntu/blue-www/
$ cat > hooks/post-receive
#!/bin/sh
GIT_WORK_TREE=/home/ubuntu/blue-www/ git checkout -f


Make post-receive executable:
$ chmod +x hooks/post-receive
```
## Select "All traffic" as inbound and outbound rules for EC2 instance

# Setup remote git repo on canary2

## Create a bare repository

```bash
$ mkdir green.git
$ cd green.git
$ git init --bare
```

## Set GIT_WORK_TREE

```bash
$ mkdir /home/ubuntu/green-www/
$ cat > hooks/post-receive
#!/bin/sh
GIT_WORK_TREE=/home/ubuntu/green-www/ git checkout -f


Make post-receive executable:
$ chmod +x hooks/post-receive

```
## Select "All traffic" as inbound and outbound rules for EC2 instance

Evaluation
-------------

**Milestone#Deploy** is evaluated based on the following
 **Evaluation Parameters:**

 - Automatic deployment environment configuration: 20%
   
 - Deployment of binaries created by build step: 20%
   
 - Remote deployment: 20%
   
 - Canary releasing: 20%
   
 - Canary analysis: 20%

----------
