# coding=utf-8
#####################################################
# THIS FILE IS AUTOMATICALLY GENERATED. DO NOT EDIT #
#####################################################
# noqa: E128,E201
from .client import BaseClient
from .client import createApiClient
from .client import config
from .client import createTemporaryCredentials
from .client import createSession
_defaultConfig = config


class WorkerManager(BaseClient):
    """
    This service manages workers, including provisioning for dynamic workertypes.
    """

    classOptions = {
    }
    serviceName = 'worker-manager'
    apiVersion = 'v1'

    def ping(self, *args, **kwargs):
        """
        Ping Server

        Respond without doing anything.
        This endpoint is used to check that the service is up.

        This method is ``stable``
        """

        return self._makeApiCall(self.funcinfo["ping"], *args, **kwargs)

    def createWorkerType(self, *args, **kwargs):
        """
        Create WorkerType

        Create a new workertype. If the workertype already exists, this will throw an error.

        This method is ``experimental``
        """

        return self._makeApiCall(self.funcinfo["createWorkerType"], *args, **kwargs)

    def updateWorkerType(self, *args, **kwargs):
        """
        Update WorkerType

        Given an existing workertype definition, this will modify it and return the new definition.

        This method is ``experimental``
        """

        return self._makeApiCall(self.funcinfo["updateWorkerType"], *args, **kwargs)

    def workerType(self, *args, **kwargs):
        """
        Get WorkerType

        Fetch an existing workertype defition.

        This method is ``experimental``
        """

        return self._makeApiCall(self.funcinfo["workerType"], *args, **kwargs)

    def deleteWorkerType(self, *args, **kwargs):
        """
        Delete WorkerType

        Delete an existing workertype definition.

        This method is ``experimental``
        """

        return self._makeApiCall(self.funcinfo["deleteWorkerType"], *args, **kwargs)

    def listWorkerTypes(self, *args, **kwargs):
        """
        List All WorkerTypes

        Get the list of all the existing workertypes

        This method is ``experimental``
        """

        return self._makeApiCall(self.funcinfo["listWorkerTypes"], *args, **kwargs)

    def credentialsGoogle(self, *args, **kwargs):
        """
        Google Credentials

        Get Taskcluster credentials for a worker given an Instance Identity Token

        This method is ``experimental``
        """

        return self._makeApiCall(self.funcinfo["credentialsGoogle"], *args, **kwargs)

    funcinfo = {
        "createWorkerType": {
            'args': ['workerTypeName'],
            'input': 'v1/create-workertype-request.json#',
            'method': 'put',
            'name': 'createWorkerType',
            'output': 'v1/workertype-full.json#',
            'route': '/workertype/<workerTypeName>',
            'stability': 'experimental',
        },
        "credentialsGoogle": {
            'args': ['workerTypeName'],
            'input': 'v1/credentials-google-request.json#',
            'method': 'post',
            'name': 'credentialsGoogle',
            'output': 'v1/temp-creds-response.json#',
            'route': '/credentials/google/<workerTypeName>',
            'stability': 'experimental',
        },
        "deleteWorkerType": {
            'args': ['workerTypeName'],
            'method': 'delete',
            'name': 'deleteWorkerType',
            'route': '/workertype/<workerTypeName>',
            'stability': 'experimental',
        },
        "listWorkerTypes": {
            'args': [],
            'method': 'get',
            'name': 'listWorkerTypes',
            'output': 'v1/workertype-list.json#',
            'query': ['continuationToken', 'limit'],
            'route': '/workertypes',
            'stability': 'experimental',
        },
        "ping": {
            'args': [],
            'method': 'get',
            'name': 'ping',
            'route': '/ping',
            'stability': 'stable',
        },
        "updateWorkerType": {
            'args': ['workerTypeName'],
            'input': 'v1/create-workertype-request.json#',
            'method': 'post',
            'name': 'updateWorkerType',
            'output': 'v1/workertype-full.json#',
            'route': '/workertype/<workerTypeName>',
            'stability': 'experimental',
        },
        "workerType": {
            'args': ['workerTypeName'],
            'method': 'get',
            'name': 'workerType',
            'output': 'v1/workertype-full.json#',
            'route': '/workertype/<workerTypeName>',
            'stability': 'experimental',
        },
    }


__all__ = ['createTemporaryCredentials', 'config', '_defaultConfig', 'createApiClient', 'createSession', 'WorkerManager']
