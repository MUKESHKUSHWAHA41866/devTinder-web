# React + Vite

This template provides a minimal setup to get React working in Vite with HMR and some ESLint rules.

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react/README.md) uses [Babel](https://babeljs.io/) for Fast Refresh
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react-swc) uses [SWC](https://swc.rs/) for Fast Refresh



Create a Vite + React application
Remove unecessary code and create a Hello World app
Install Tailwind CSS
Install Daisy UI
Add NavBar component to App.jsx
Create a NavBar.jsx separate Component file
Install react router dom
Create BrowserRouter > Routes > Route=/ Body > RouteChildren
Create an Outlet in your Body Component
Create a footer
Create a Login Page
Install axios
CORS - install cors in backend => add middleware to with configurations: orgin, credentials: true
Whenever you're making API call so pass axios => { withCredentials: true }
install react-redux + @reduxjs/toolkit - https://redux-toolkit.js.org/tutorials/quick-start
configureStore => Provider => createSlice => add reducer to store
Add redux devtools in chrome
Login and see if your data is coming properly in the store
NavBar should update as soon as user logs in
Refactor our code to add constants file + create a components folder
You should not be access other routes without login
If token is not present, redirect user to login page
Logout Feature
Get the feed and add the feed in th store
build the user card on feed
Edit Profile Feature
Show Toast Message on save of profile
New Page - See all my connections
New Page - See all my Conenction REquests
Feature - Accept/Reject connection request
Send/Ignore the user card from the feed
Signup New User
E2E testing
Body NavBar Route=/ => Feed Route=/login => Login Route=/connetions => Connections Router=/profile => Profile


Step-by-Step Fix: GitHub SSH Access on EC2
Check for SSH Key
Run this:

bash
Copy
Edit
ls -al ~/.ssh
Look for files like:

id_ed25519

id_ed25519.pub

If they don’t exist, generate one:

bash
Copy
Edit
ssh-keygen -t ed25519 -C "your_email@example.com"
Press Enter through prompts to accept default file names.

🔐 Step 2: Add SSH Key to the Agent
Start the SSH agent and add your private key:

bash
Copy
Edit
eval "$(ssh-agent -s)"
ssh-add ~/.ssh/id_ed25519
📋 Step 3: Add Public Key to GitHub
Print your public key:

bash
Copy
Edit
cat ~/.ssh/id_ed25519.pub
Copy the output.

Go to: https://github.com/settings/keys

Click "New SSH key", give a title, and paste the key.

Click Add SSH key.

⚙️ Step 4: Optional – Configure SSH (if using custom filenames)
If your private key is not named id_ed25519, update your SSH config:

bash
Copy
Edit
nano ~/.ssh/config
Add this:

bash
Copy
Edit
Host github.com
  HostName github.com
  User git
  IdentityFile ~/.ssh/id_ed25519
Then save (Ctrl + X, then Y, then Enter).

🔁 Step 5: Test the SSH Connection
bash
Copy
Edit
ssh -T git@github.com
You should see:

vbnet
Copy
Edit
Hi MUKESHKUSHWAHA41866! You've successfully authenticated, but GitHub does not provide shell access.
✅ If yes → you're now ready to clone:

bash
Copy
Edit
git clone git@github.com:MUKESHKUSHWAHA41866/devTinder-web.git
Let me know what the output of each step is, and I’ll help troubleshoot further if needed.
# Deployment

- Signup on AWS 
- Launch instance
- chmod 400 <secret>.pem    :    chmod 400 "devTinder-secret.pem"
   -   ssh -i "devTinder-secret.pem" ubuntu@ec2-51-20-104-88.eu-north-1.compute.amazonaws.com

- ssh -i "devTinder-secret.pem" ubuntu@ec2-43-204-96-49.ap-south-1.compute.amazonaws.com
go this  website   https://docs.aws.amazon.com/sdk-for-javascript/v2/developer-guide/setting-up-node-on-ec2-instance.html
node install in vitual machine:  curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.7/install.sh | bash
- Install Node version 16.17.0      nvm install 21.6.1
- Git clone
- Frontend    
    - npm install  -> dependencies install
    - npm run build
    - sudo apt update
    - sudo apt install nginx
    - sudo systemctl start nginx
    - sudo systemctl enable nginx
    - Copy code from dist(build files) to /var/www/html/ 
    - sudo scp -r dist/* /var/www/html/
    - Enable port :80 of your instance
- Backend
    - updated DB password
    - allowed ec2 instance public IP on mongodb server
    - npm intsall pm2 -g
    - pm2 start npm --name "devTinder-backend" -- start
    - pm2 logs
    - pm2 list, pm2 flush <name> , pm2 stop <name>, pm2 delete <name>
    - config nginx - /etc/nginx/sites-available/default
    - restart nginx - sudo systemctl restart nginx
    - Modify the BASEURL in frontend project to "/api"




    Ngxinx config:
    Frontend = http://51.20.104.88/
    Backend = http://51.20.104.88/:7777/

    Domain name = devtinder.com => 43.204.96.49

    Frontend = devtinder.com
    Backend = devtinder.com:7777 => devtinder.com/api

    nginx config : 

    server_name 51.20.104.88;

    location /api/ {
        proxy_pass http://localhost:7777/;  # Pass the request to the Node.js app
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }