helm del --purge demo
helm install charts/fr-demo --name demo
kubectl get po --watch