# aci-demos
Demos with ACI 


The imagesRecognition folder has a Dockerfile to deploy python code that does facial recognition on multiple pictures and counts up the amount of throughput for each node - meant to be used across a kubernetes cluster

The other folder has a Dockerfile to deploy an html UI that has a dashboard of the metrics from the cluster's throughput of the above Dockerfile. 

Contact ria.bhatia@microsoft.com if you need help!



steps to deploy dis demo

create resource group 
`az group create --name myResourceGroup --location westeurope`

deploy acs cluster
`az acs create --orchestrator-type kubernetes --resource-group myResourceGroup --name myK8sCluster --generate-ssh-keys`

get creds
`az acs kubernetes get-credentials --resource-group=myResourceGroup --name=myK8sCluster`

make sure you're connected 
`kubectl get nodes`

get the demo image
`docker pull rbitia/aci-demo`

clone this repo
`git clone https:github.com/rbitia/aci-demos.git`

`cd imageRecogniton`

deploy the pods 
`kubectl deploy deployment.yaml`

use the same rg for aci or a new one 
`az group create -n aci-test -l westus`

grab your sub id
`az account list -o table`

`az ad sp create-for-rbac --role=Contributor --scopes /subscriptions/<subscriptionId>/`

clone the aci-connector repo 
`git clone https://github.com/Azure/aci-connector-k8s.git`

edit your yaml file from within the aci-connector folder 
`vim examples/aci-connector.yaml`

deploy the aci-connector 
`kubectl create -f examples/aci-connector.yaml`

