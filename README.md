# aci-demos
Demos with ACI

Description: Run a facial recognition demo across your AKS cluster and use ACI and the ACI Connector to burst into for on-demand compute.

Contact ria.bhatia@microsoft.com if you need help!

steps to deploy dis demo & talking tips

Part 1
create resource group
```
$ az group create --name myResourceGroup --location westus2
```

deploy aks kub cluster
```
$ az aks create --resource-group myResourceGroup --name myK8sCluster --agent-count 1 --generate-ssh-keys

```

get creds
```
$ az aks install-cli
$ az aks kubernetes get-credentials --resource-group=myResourceGroup --name=myK8sCluster
```

make sure you're connected
```
$ kubectl get nodes
```

clone this repo
```
$ git clone https://github.com/rbitia/aci-demos.git
```

Make sure you have helm installed and initialize this
```
$ export TILLER_NAMESPACE=aci-demo
$ kubectl create namespace aci-demo
$ helm init
```
edit the values.yaml file and replace <your domain> with your own hosted domain
```
$ cd aci-demos/charts  
$ vim values.yaml
```

install kube-lego w/ helm for certs

```
helm install stable/kube-lego --name kube-lego --namespace kube-system --set config.LEGO_EMAIL=<your email>,config.LEGO_URL=https://acme-v01.api.letsencrypt.org/directory
```

install ingress controller w/ helm
 ```
 helm install stable/nginx-ingress --name ingress --namespace kube-system
 ```
 ^set up can be done before you demo

Start at the top of the aci-demos directory and deploy the Facial Recognition application that consists of a frontend, a backend, and a set of image recognizers.

```
$ helm install charts/fr-demo --name demo
```
Checkout the UI that's generated in the output and see the pictures start to get processed
Right now you first need to reset the demo at fr-backend.<your domain>
Now checkout the UI which is usually at fr.<your domain>

Super slow because we have a 1 node AKS cluster.

Deploy the ACI connector :

clone the aci-connector repo
```
$ git clone https://github.com/Azure/aci-connector-k8s.git
$ cd aci-connector-k8s/examples
```

run this script from the examples folder which auto makes your sp and edits the examples/aci-connector.yaml file & all this set up can be done beforehand
```
$ python3 generateManifest.py --resource-group <resource group> --location <location> --subscription-id <subscription id>
```
Move the .yaml file to your aci-demo folder so you can create the connector from within it
I suggest moving it to charts/aci-connector/aci-connector.yaml. You can also use a helm chart to create the connector which is also specified within the aci-connector-k8s repo.

deploy the aci-connector from the aci-demo folder
```
$ cd ../../aci-demos
$ kubectl create -f charts/aci-connector/aci-connector.yaml
```

The connector has been deployed and with a `kubectl get nodes` you can see that the aci-connector is a new node in your cluster. Now scale up the image recognizer to 10 using the following command

```
$ kubectl scale deploy demo-fr-ir-aci --replicas 10
```
Though we are using `kubectl`, the ACI Connector is dispatching pods to Azure Container Instances transparently, via the ACI connector node.
This virtual node has unlimited capacity and a per-second billing model, making it perfect for burst compute scenarios like this one.
If we wait a minute or so for the ACI containers to warm up, we should see image recognizer throughput increase dramatically.

Check out the dashboard to see throughput it dramatically increase...

Here we can see throughput really beginning to pick up, thanks to burst capacity provided by ACI.
 
This is powerful stuff.  Here we can see AKS and ACI combine to provide the best of “serverless” computing – invisible infrastructure and micro-billing – all managed through the open Kubernetes APIs.  This kind of innovation – the marriage of containers and serverless computing -- is important for the industry, and Microsoft is working hard to make it a reality.
