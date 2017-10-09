# aci-demos
Demos with ACI


The imagesRecognition folder has a Dockerfile to deploy python code that does facial recognition on multiple pictures and counts up the amount of throughput for each node - meant to be used across a kubernetes cluster

The other folder has a Dockerfile to deploy an html UI that has a dashboard of the metrics from the cluster's throughput of the above Dockerfile.

Contact ria.bhatia@microsoft.com if you need help!



steps to deploy dis demo

Part 1
create resource group
```
$ az group create --name myResourceGroup --location westeurope
```

deploy acs kub cluster
```
$ az acs create --orchestrator-type kubernetes --resource-group myResourceGroup --name myK8sCluster --generate-ssh-keys
```

get creds
```
$ az acs kubernetes get-credentials --resource-group=myResourceGroup --name=myK8sCluster
```

make sure you're connected
```
$ kubectl get nodes
```

clone this repo
```
$ git clone https://github.com/rbitia/aci-demos.git
```

See the dashboard - check throughout the demo 
```
$ kubectl proxy
```

In another cmd promt lets ramp up utilization
Make sure you have helm installed and initialize this
```
$ export TILLER_NAMESPACE=aci-demo
$ kubectl create namespace aci-demo
$ helm init
```

Start at the top of the aci-demos directory
Install the webserver chart
```
$ helm inspect values charts/webserver > customWeb.yaml
$ helm install -n webserver -f customWeb.yaml charts/webserver
```

Grab the webserver ip
```
$ kubectl get svc
```

Edit  aci-demos/charts/aci-ui/values.yaml with the webServerIP address under ui

Install the aci-ui chart
```
$ helm inspect values charts/aci-ui > customUI.yaml
$ helm install -n aci-ui -f customUI.yaml charts/aci-ui
```


Deploy the UI and image recognition work across the cluster
```
$ helm inspect values charts/aci-demo > custom.yaml
$ helm install -n aci-demo -f custom.yaml charts/aci-demo
```

Wait a couple minutes and grab the ui ip and in your browser go to <ui ip>:80
```
$ kubectl get svc
```


To clean up unless you want to go to part 2 then skip:
```
$ Helm del --purge webserver
$ Helm del --purge aci-ui
$ Helm del --purge aci-demo.
```

Part 2
Delete the deployment across the cluster
```
$ helm del --purge aci-demo
```

Deploy the ACI connector :
Use the same rg as ACS
grab your sub id
```
$ az account list -o table
$ az ad sp create-for-rbac --role=Contributor --scopes /subscriptions/<subscriptionId>/
```
clone the aci-connector repo
```
$ git clone https://github.com/Azure/aci-connector-k8s.git
```

edit your yaml file from within the aci-connector folder ( you could use helm too)
```
$ vim examples/aci-connector.yaml
```

deploy the aci-connector ( you could use helm too)
```
$ kubectl create -f examples/aci-connector.yaml
```


Change the replicas in aci-demos/charts/aci-demo/values.yaml of the work across aci vs the cluster

Deploy the work across the cluster
```
$ helm inspect values charts/aci-demo > custom.yaml
$ helm install -n aci-demo -f custom.yaml charts/aci-demo
```


To clean up
```
$ Helm del --purge webserver
$ Helm del --purge aci-demo
$ Helm del --purge aci-ui
$ Kubectl delete deployment aci-connector
```
