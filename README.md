# aci-demos

## Demos with ACI

Description: Run a facial recognition demo across your AKS cluster and use ACI and the ACI Connector to burst into for on-demand compute.

Contact ria.bhatia@microsoft.com if you need help!

steps to deploy dis demo & talking tips

### Part 1 Prerequisites

In order to run this demo, you will need the following:

- An active [Microsoft Azure](https://azure.microsoft.com/en-us/free "Microsoft Azure") Subscription
- [Azure CLI](https://docs.microsoft.com/en-us/cli/azure/overview?view=azure-cli-latest "Azure CLI") installed
- [Kubernetes CLI (kubectl)](https://kubernetes.io/docs/tasks/tools/install-kubectl/ "Kubernetes CLI (kubectl)") installed
- [Helm client](https://docs.helm.sh/using_helm/#installing-helm) installed

### Part 2 Setup
Replace `<myResourceGroup>` with your expected and run following command to create resource group. Then remember the created resource group name.

```
$ az group create --name <myResourceGroup> --location eastus
```

> **Note:** The AKS extending to ACI only support in one location. So far AKS and ACI are both deployed to East US and West Europe. So please create your resource group in East US or West Europe only.

Replace `<myResourceGroup>`,`<myK8sCluster>` with your expected and run following command to create the AKS. Then remember the AKS name.

```
$ az aks create --resource-group <myResourceGroup> --name <myK8sCluster> --node-count 1 --generate-ssh-keys

```

Replace `<myResourceGroup>`, `<myK8sCluster>` with your created in previous steps and run following command to set the AKS as your current connected cluster.

```
$ az aks get-credentials --resource-group <myResourceGroup> --name <myK8sCluster>
```

Make sure you're connected.

```
$ kubectl get nodes
```

Make sure you have helm installed and initialize this.
```
$ helm init
```

Replace `<your email>` with yours and run to install kube-lego w/ helm for certs.

```
$ helm install stable/kube-lego --name kube-lego --namespace kube-system --set config.LEGO_EMAIL=<your email>,config.LEGO_URL=https://acme-v01.api.letsencrypt.org/directory
```

Install ingress controller w/ helm.

```
$ helm install stable/nginx-ingress --name ingress --namespace kube-system
```

Get the Public IP of the ingress controller. It may take some times for the IP assigned to the services

```
$ kubectl get services --namespace kube-system --watch
```

When the IP assigned, remember the IP address and press Ctrl+Q to exit

Clone this repo
```
$ git clone https://github.com/rbitia/aci-demos.git
```

Change the folder to the root of the source code
```
$ cd aci-demo
```

Replace `<myResourceGroup>`, `<IP Address>` with your created in previous steps. Replace `<appName>` with your expected and run following shell script to bind FQDN to your IP. Remember the return FQDN name. You will use it to update your configuration file.

```
$ assignFQDNtoIP.sh -g <myResourceGroup> -d <appName> -i <IP Address>

```

Edit the values.yaml file and replace all `<host name>` with the FQDN name in pervious step.
```
$ cd aci-demos/charts/fr-demo/  
$ vim values.yaml
```

Start at the top of the aci-demos directory and deploy the Facial Recognition application that consists of a frontend, a backend, and a set of image recognizers.

```
$ helm install charts/fr-demo --name demo
```

Checkout the UI that's generated in the output and see the pictures start to get processed
The rate will be super slow because we have a 1 node AKS cluster running 1 worker pod.

Deploy the ACI connector :
Replace `<myResourceGroupmy>`, `<myK8sCluster>` with yours in previous steps and run following command

```
az aks install-connector --resource-group <myResourceGroup> --name <myK8sCluster> --connector-name myaciconnector
```

The connector has been deployed and with a `kubectl get nodes` you can see that the ACI Connector is a new node in your cluster. Now scale up the image recognizer to 10 using the following command

```
$ kubectl scale deploy demo-fr-ir-aci --replicas 10
```
Though we are using `kubectl`, the ACI Connector is dispatching pods to Azure Container Instances transparently, via the ACI connector node.
This virtual node has unlimited capacity and a per-second billing model, making it perfect for burst compute scenarios like this one.
If we wait a minute or so for the ACI containers to warm up, we should see image recognizer throughput increase dramatically.

Check out the dashboard to see throughput it dramatically increase...

Here we can see throughput really beginning to pick up, thanks to burst capacity provided by ACI.
 
This is powerful stuff.  Here we can see AKS and ACI combine to provide the best of “serverless” computing – invisible infrastructure and micro-billing – all managed through the open Kubernetes APIs.  This kind of innovation – the marriage of containers and serverless computing -- is important for the industry, and Microsoft is working hard to make it a reality.


Once you've done all the set up you just need these commands during the live demo:
```
$ helm install charts/fr-demo --name demo
$ az aks install-connector --resource-group myResourceGroup --name myK8sCluster --connector-name myaciconnector
$ kubectl scale deploy demo-fr-ir-aci --replicas 10
```


To clean up:
```
$ helm del --purge demo
$ az aks remove-connector --resource-group myResourceGroup --name myAKSCluster --connector-name myaciconnector
```
