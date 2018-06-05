import argparse
import json
import os
import subprocess

DEFAULT_LOCATION = "westus"
BASE_CONFIG_FILE = "example-aci-connector.yaml"

def main():
    """ Auto generate the yml file with the needed credentials"""

    parser = argparse.ArgumentParser(
        formatter_class=argparse.RawTextHelpFormatter,
        description='''Automatically generate the connector yaml file with the needed credentials. Either create a resource
        REQUIREMENTS:
        1) Azure CLI is installed
        2) The desired subscription Id is set as current in the CLI or is provided with the -s flag''',
        epilog='''Example:
        python generateManifest.py --create-group --resource-group myResourceGroup --helm''')

    parser.add_argument(
        "-cr",
        "--create-group",
        action='store_true',
        help="Creates a resource group. Must provide resource group name with (-g) and location (-l)"
    )
    parser.add_argument("--helm", help="Output Helm installation all command", type=bool, const=True, nargs='?')
    parser.add_argument("-g", "--resource-group", help="Name of resource group", required=True)
    parser.add_argument("-s", "--subscription-id", help="Subscription ID")
    parser.add_argument("-l", "--location", help="Resource Location")
    parser.add_argument("-f", "--file", help="filename for the output file")

    args = parser.parse_args()

    if not os.path.isfile(BASE_CONFIG_FILE):
        print("Could not find base configuration file: ", BASE_CONFIG_FILE)

    resource_group = args.resource_group

    if (args.create_group):

        print("Creating Resource Group ", resource_group)

        if (args.location):
            location = args.location
        else:
            print("Using defalut location: " + DEFAULT_LOCATION)
            location = DEFAULT_LOCATION

        response = json.loads(
            subprocess.check_output(
                "az group create -n " + resource_group + " -l " + location,
                shell=True
            ))

        if(response['properties']['provisioningState'] != 'Succeeded'):
            print("An Error occured while creating the resource group: ", resource_group)
            exit(-1)

        subscription_id = response['id'].split('/')[2]

    else:
        resource_group = args.resource_group
        if(resource_group == None):
            print("Must provide a resource group name")
            exit(-1)

        subscription_id = args.subscription_id
        if(subscription_id == None):
            print("Must provide a subscription Id unless you create a new resource group")
            exit(-1)

    print("Creating Service Principal")
    app_info = json.loads(
        subprocess.check_output(
            "az ad sp create-for-rbac --role=Contributor --scopes /subscriptions/" + subscription_id + "/",
            shell=True
        ).decode("utf-8")
    )

    try:
        replacements = {
            "<CLIENT_ID>": app_info['appId'],
            "<CLIENT_KEY>": app_info['password'],
            "<TENANT_ID>": app_info['tenant'],
            "<SUBSCRIPTION_ID>": subscription_id,
            "<RESOURCE_GROUP>": resource_group
        }
    except:
        print("Unable to create a service principal")
        exit(-1)

    if (args.helm):
        print("Run the following command to install the ACI connector:")
        print("-----Begin Command----")
        print("helm install --name my-release --set env.azureClientId=%s,env.azureClientKey=%s,env.azureTenantId=%s,env.azureSubscriptionId=%s,env.aciResourceGroup=%s,env.aciRegion=%s ../charts/aci-connector" % (app_info['appId'], app_info['password'], app_info['tenant'], subscription_id, resource_group, location))
        print("-----End Command----")
    else:
        with open('example-aci-connector.yaml', 'r') as file:
            filedata = file.read()

        for key, value in replacements.items():
            filedata = filedata.replace(key, value)

        filename = args.file
        if (filename == None):
            filename = "aci-connector.yaml"

        with open(filename, 'w') as file:
            file.write(filedata)

if __name__ == '__main__':
    main()
