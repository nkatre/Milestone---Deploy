DevOps Milestone - Deployment
===================
Team Members:

 - Nikhil Katre (nkatre@ncsu.edu)
 - Pengyu Li (pli5@ncsu.edu)
 
Submission: **Milestone#Deploy** <br>
Link to Sample Web Application Used: [WebGoat](https://github.com/nkatre/WebGoat) <br>
Submission Files:
>  - README.md


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

Public IP Addresses
-------------
All servers are hosted in AWS using EC2 service

 1. Master = 52.4.40.18
 2. Canary 1 (Blue) = 52.5.33.235
 3. Canary 2 (Green) = 52.5.15.126

A common key is used to access the above three servers. The AWS key file is named `Nikhil.pem` and can be found with this submission in the folder `AWSKey`

Diagram
![ProjectPlan](https://github.com/nkatre/Milestone---Deploy/blob/master/outputImages/diagram1.png)


Installations and AWS Settings
-------------
Install the following **ON ALL THREE INSTANCES (master, canary1 and canary2)** to achieve this Milestone
 1.  Download and install [salt](http://docs.saltstack.com/en/latest/topics/installation/)
 2.  Download and Install [git](http://git-scm.com/book/en/v2/Getting-Started-Installing-Git)
 3. ON ALL THREE INSTANCES (master, canary1 and canary2) allow **all traffic** option selected from security group in AWS


## I.  Automatic deployment environment configuration

We have created a shell script called ***automatic_deployment.sh*** to achieve an automatic deployment environment.

The shell script does the following:

 - Install the basic infrastructure which includes installing `git`, `redis-server`, `nodejs`, `npm`, `node` and `redis`
 - Using git clone the repository which contains infrastructure to set up canary release environment and monitoring health status of the server.
 - Now we run the monitor and canary server1 using the same shell script
 - The following are the commands written in the shell script.

>     sudo apt-get install git
>     git clone https://github.com/nkatre/Milestone---Deploy.git
>     cd Milestone---Deploy/infrastructure/
>     chmod +x deploy_infrastructure.sh 
>     ./deploy_infrastructure.sh 
>     cd ../monitor/  
>     node main.js

Now we do the following:
1. Deliver ***automatic_deployment.sh*** to canary1 using salt-stack using the below command
	
    sudo salt canary1 cp.get_file salt://automatic_deploy.sh /home/ubuntu/automatic_deploy.sh

2. Remote execute ***automatic_deployment.sh*** using salt and automatically deploy and start canary1 server.

sudo salt canary1 cmd.run "chmod +x automatic_deploy.sh"

sudo salt canary1 cmd.run "./automatic_deploy.sh"

## II.  Deployment of binaries created by build step

 1. In each instances of the servers, canary1 and canary 2 we are building the application locally. That is each of the servers, canary1 and canary2 have build management tool (Here, we have used salt-stack).
 2. After build is successful, the binaries are deployed and the application is run on each of the server instances.
 3. This is taken care since the salt-stack builds the application on each of the server instances.


III. Remote deployment
-------------
Make canary1 and canary2 remote repositories to master. We will use git to deploy the code remotely using `post-receive hook` in bare git repository
 
The following steps should be followed to make canary1 and canary2 as remote repository of master

-- Steps for Master
 1. `ssh` to master using `ssh -i Nikhil.pem ubuntu@52.4.40.18` where `Nikhil.pem` is the AWS key file attached with this submission
 2. Create a folder  
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
Setup remote git repo on canary1

### Create a bare repository

```bash
$ mkdir blue.git
$ cd blue.git
$ git init --bare
```

### Set GIT_WORK_TREE

```bash
$ mkdir /home/ubuntu/blue-www/
$ cat > hooks/post-receive
#!/bin/sh
GIT_WORK_TREE=/home/ubuntu/blue-www/ git checkout -f


Make post-receive executable:
$ chmod +x hooks/post-receive

Select "All traffic" as inbound and outbound rules for EC2 instance
```

## Setup remote git repo on canary2

### Create a bare repository

```bash
$ mkdir green.git
$ cd green.git
$ git init --bare
```

### Set GIT_WORK_TREE

```bash
$ mkdir /home/ubuntu/green-www/
$ cat > hooks/post-receive
#!/bin/sh
GIT_WORK_TREE=/home/ubuntu/green-www/ git checkout -f


Make post-receive executable:
$ chmod +x hooks/post-receive


Select "All traffic" as inbound and outbound rules for EC2 instance
```

## IV. Canary Release

### Create a Proxy server as Canary release router
We have created a proxy sever as a router on http://52.4.40.18:5000. When users visit this address, the router will randomly select 85% of users to visit the production server(canary2), and selects 15% of users to visit the test server(canary1). Every new version of the code is pushed on canary 1. 

	// get a random number
	function randomIntInc (low, high) {
    		return Math.floor(Math.random() * (high - low + 1) + low);
	}
	var num = randomIntInc(1, 100);
	if (num > 15) {
		// visit product server(canary1);
	} else {
		// visit test server(canary2);
	}

After bulit the application successfully on build server, we deploy the new version of application on test server(canary1). In this case, we can get 15% of users' test data. When all test cases are successful, we deploy this version to product server(canary2). 

According to above strategy, we can implement the canary deployment and canary release.

## V. Monitoring deployed application

After deployment of new version on Canary 1, we are monitoring the health of this server by parameters such as CPU usage, memory utilization, Fault number and Alert number.

One can visit `monitor.html` on Canary 1 to check the status of the server.

We have also set a threshold parameter to simulate server failure condition. We use two paramaters which are constantly monitored.

    1. Memory Usage
    2. CPU Usage:

***`ALERT:`* If the memory usage is above 30 and the CPU usage is above 20  then alert would be set off. *`FAILURE:`* If the memory usage if above 70 and the CPU usage is above 50 then the server would fail.**

To demonstrate this, follow the below mentioned images:

1. This image demonstrates alert when threshold values are crossed. Here the alert count is 1 (alert is set off) since the CPU usage is 33 which is above 20 and the memory usage is 45 which is above 30.
![Alert](https://github.com/nkatre/Milestone---Deploy/blob/master/outputImages/result1.png)
2. This image demonstrates that when the threshold values for failure are crossed. Then the failure is set and this would in turn fail the server and the traffic would be redirected to the other server which is canary 2. In this image since the memory usage is above 70 and the CPU usage is above 50 hence the server has crossed the failure threshold and has failed. Thus, now the traffic would be redirected to another server.
![Failure](https://github.com/nkatre/Milestone---Deploy/blob/master/outputImages/result3.png)


