#!/bin/bash

. ./util.sh

run "helm install charts/fr-demo --name demo"

run "kubectl get po -o wide"

run "cd $GOPATH/src/github.com/Azure/aci-connector-k8s"

run "helm install charts/aci-connector --name aci-connector --namespace kube-system -f myvalues.yaml"

run "kubectl get nodes"

run "kubectl get po -o wide"