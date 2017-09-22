# Helm Charts

## Prerequisites:

- You have an ACS cluster set up, and `kubectl` is pointing to it
- You have installed `aci-connector` and verified that it is working
- You have Helm installed, and have run `helm init` on your cluster
  - Because of a bug in ACS, you might have to do this:

```
$ export TILLER_NAMESPACE=aci-demo
$ kubectl create namespace aci-demo
$ helm init
```

## Install Demo

Assuming you are starting at the top of the aci-demos repository:


```
$ helm inspect values charts/aci-demo > custom.yaml
$ # edit custom.yaml
$ helm install -n aci-demo -f custom.yaml charts/aci-demo
```

Read the output of that command carefully! It will tell you how to connect to
the UI.

## See what you've done

You should have two deployments:

```
$ kubectl get deploy
```

You should have one service:

```
$ kubectl get service
```

You should have 20 pods, all running in ACI

```
$ kubectl get pod
$ az container list
```

You can see all the details with:

```
$ helm get aci-demo
```

## Destroying the Demo

```
$ helm delete --purge aci-demo
```
