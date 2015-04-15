sudo apt-get install git
git clone https://github.com/nkatre/Milestone---Deploy.git
cd Milestone---Deploy/infrastructure/
chmod +x deploy_infrastructure.sh
./deploy_infrastructure.sh
node server_1.js
cd ../monitor/
node main.js

