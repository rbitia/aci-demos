#!/bin/bash

while getopts "g:d:i:" opt; do  
  case $opt in  
    g)  
      echo "Resource Group is $OPTARG"
      RESOURCEGROUP=$OPTARG
      ;;  
    d)  
      echo "DNS name is $OPTARG"  
      DNSNAME=$OPTARG
      ;;
    i)
      echo "IP is $OPTARG"
      IP=$OPTARG
      ;;  
    \?)  
      echo "Invalid option: -$OPTARG"   
      ;;
  esac  
done  

# Get resource group and public ip name
RESOURCEGROUP=$(az network public-ip list --query "[?ipAddress!=null]|[?contains(ipAddress, '$IP')].[resourceGroup]" --output tsv)
PIPNAME=$(az network public-ip list --query "[?ipAddress!=null]|[?contains(ipAddress, '$IP')].[name]" --output tsv)

# Update public ip address with dns name
echo "Start assigning domain name to IP $IP..."
az network public-ip update --resource-group $RESOURCEGROUP --name  $PIPNAME --dns-name $DNSNAME >/dev/null

az network public-ip list --query "[?ipAddress=='$IP']|[0].dnsSettings.fqdn"
