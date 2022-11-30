#![allow(unused_imports)]
#![cfg_attr(rustfmt, rustfmt_skip)]
/* THIS FILE IS AUTOMATICALLY GENERATED. DO NOT EDIT */
use crate::{Client, ClientBuilder, Credentials, Retry};
use anyhow::Error;
use serde_json::Value;
use std::time::Duration;
use crate::util::urlencode;

/// Hooks Service
///
/// The hooks service provides a mechanism for creating tasks in response to events.
///
pub struct Hooks {
    /// The underlying client used to make API calls for this service.
    pub client: Client
}

#[allow(non_snake_case)]
impl Hooks {
    /// Create a new Hooks instance, based on the given client builder
    pub fn new<CB: Into<ClientBuilder>>(client_builder: CB) -> Result<Self, Error> {
        Ok(Self{
            client: client_builder
                .into()
                .path_prefix("api/hooks/v1/")
                .build()?,
        })
    }

    /// Ping Server
    ///
    /// Respond without doing anything.
    /// This endpoint is used to check that the service is up.
    pub async fn ping(&self) -> Result<(), Error> {
        let method = "GET";
        let (path, query) = Self::ping_details();
        let body = None;
        let resp = self.client.request(method, path, query, body).await?;
        resp.bytes().await?;
        Ok(())
    }

    /// Generate an unsigned URL for the ping endpoint
    pub fn ping_url(&self) -> Result<String, Error> {
        let (path, query) = Self::ping_details();
        self.client.make_url(path, query)
    }

    /// Generate a signed URL for the ping endpoint
    pub fn ping_signed_url(&self, ttl: Duration) -> Result<String, Error> {
        let (path, query) = Self::ping_details();
        self.client.make_signed_url(path, query, ttl)
    }

    /// Determine the HTTP request details for ping
    fn ping_details<'a>() -> (&'static str, Option<Vec<(&'static str, &'a str)>>) {
        let path = "ping";
        let query = None;

        (path, query)
    }

    /// Load Balancer Heartbeat
    ///
    /// Respond without doing anything.
    /// This endpoint is used to check that the service is up.
    pub async fn lbheartbeat(&self) -> Result<(), Error> {
        let method = "GET";
        let (path, query) = Self::lbheartbeat_details();
        let body = None;
        let resp = self.client.request(method, path, query, body).await?;
        resp.bytes().await?;
        Ok(())
    }

    /// Generate an unsigned URL for the lbheartbeat endpoint
    pub fn lbheartbeat_url(&self) -> Result<String, Error> {
        let (path, query) = Self::lbheartbeat_details();
        self.client.make_url(path, query)
    }

    /// Generate a signed URL for the lbheartbeat endpoint
    pub fn lbheartbeat_signed_url(&self, ttl: Duration) -> Result<String, Error> {
        let (path, query) = Self::lbheartbeat_details();
        self.client.make_signed_url(path, query, ttl)
    }

    /// Determine the HTTP request details for lbheartbeat
    fn lbheartbeat_details<'a>() -> (&'static str, Option<Vec<(&'static str, &'a str)>>) {
        let path = "__lbheartbeat__";
        let query = None;

        (path, query)
    }

    /// Taskcluster Version
    ///
    /// Respond with the JSON version object.
    /// https://github.com/mozilla-services/Dockerflow/blob/main/docs/version_object.md
    pub async fn version(&self) -> Result<(), Error> {
        let method = "GET";
        let (path, query) = Self::version_details();
        let body = None;
        let resp = self.client.request(method, path, query, body).await?;
        resp.bytes().await?;
        Ok(())
    }

    /// Generate an unsigned URL for the version endpoint
    pub fn version_url(&self) -> Result<String, Error> {
        let (path, query) = Self::version_details();
        self.client.make_url(path, query)
    }

    /// Generate a signed URL for the version endpoint
    pub fn version_signed_url(&self, ttl: Duration) -> Result<String, Error> {
        let (path, query) = Self::version_details();
        self.client.make_signed_url(path, query, ttl)
    }

    /// Determine the HTTP request details for version
    fn version_details<'a>() -> (&'static str, Option<Vec<(&'static str, &'a str)>>) {
        let path = "__version__";
        let query = None;

        (path, query)
    }

    /// List hook groups
    ///
    /// This endpoint will return a list of all hook groups with at least one hook.
    pub async fn listHookGroups(&self) -> Result<Value, Error> {
        let method = "GET";
        let (path, query) = Self::listHookGroups_details();
        let body = None;
        let resp = self.client.request(method, path, query, body).await?;
        Ok(resp.json().await?)
    }

    /// Generate an unsigned URL for the listHookGroups endpoint
    pub fn listHookGroups_url(&self) -> Result<String, Error> {
        let (path, query) = Self::listHookGroups_details();
        self.client.make_url(path, query)
    }

    /// Generate a signed URL for the listHookGroups endpoint
    pub fn listHookGroups_signed_url(&self, ttl: Duration) -> Result<String, Error> {
        let (path, query) = Self::listHookGroups_details();
        self.client.make_signed_url(path, query, ttl)
    }

    /// Determine the HTTP request details for listHookGroups
    fn listHookGroups_details<'a>() -> (&'static str, Option<Vec<(&'static str, &'a str)>>) {
        let path = "hooks";
        let query = None;

        (path, query)
    }

    /// List hooks in a given group
    ///
    /// This endpoint will return a list of all the hook definitions within a
    /// given hook group.
    pub async fn listHooks(&self, hookGroupId: &str) -> Result<Value, Error> {
        let method = "GET";
        let (path, query) = Self::listHooks_details(hookGroupId);
        let body = None;
        let resp = self.client.request(method, &path, query, body).await?;
        Ok(resp.json().await?)
    }

    /// Generate an unsigned URL for the listHooks endpoint
    pub fn listHooks_url(&self, hookGroupId: &str) -> Result<String, Error> {
        let (path, query) = Self::listHooks_details(hookGroupId);
        self.client.make_url(&path, query)
    }

    /// Generate a signed URL for the listHooks endpoint
    pub fn listHooks_signed_url(&self, hookGroupId: &str, ttl: Duration) -> Result<String, Error> {
        let (path, query) = Self::listHooks_details(hookGroupId);
        self.client.make_signed_url(&path, query, ttl)
    }

    /// Determine the HTTP request details for listHooks
    fn listHooks_details<'a>(hookGroupId: &'a str) -> (String, Option<Vec<(&'static str, &'a str)>>) {
        let path = format!("hooks/{}", urlencode(hookGroupId));
        let query = None;

        (path, query)
    }

    /// Get hook definition
    ///
    /// This endpoint will return the hook definition for the given `hookGroupId`
    /// and hookId.
    pub async fn hook(&self, hookGroupId: &str, hookId: &str) -> Result<Value, Error> {
        let method = "GET";
        let (path, query) = Self::hook_details(hookGroupId, hookId);
        let body = None;
        let resp = self.client.request(method, &path, query, body).await?;
        Ok(resp.json().await?)
    }

    /// Generate an unsigned URL for the hook endpoint
    pub fn hook_url(&self, hookGroupId: &str, hookId: &str) -> Result<String, Error> {
        let (path, query) = Self::hook_details(hookGroupId, hookId);
        self.client.make_url(&path, query)
    }

    /// Generate a signed URL for the hook endpoint
    pub fn hook_signed_url(&self, hookGroupId: &str, hookId: &str, ttl: Duration) -> Result<String, Error> {
        let (path, query) = Self::hook_details(hookGroupId, hookId);
        self.client.make_signed_url(&path, query, ttl)
    }

    /// Determine the HTTP request details for hook
    fn hook_details<'a>(hookGroupId: &'a str, hookId: &'a str) -> (String, Option<Vec<(&'static str, &'a str)>>) {
        let path = format!("hooks/{}/{}", urlencode(hookGroupId), urlencode(hookId));
        let query = None;

        (path, query)
    }

    /// Get hook status
    ///
    /// This endpoint will return the current status of the hook.  This represents a
    /// snapshot in time and may vary from one call to the next.
    ///
    /// This method is deprecated in favor of listLastFires.
    pub async fn getHookStatus(&self, hookGroupId: &str, hookId: &str) -> Result<Value, Error> {
        let method = "GET";
        let (path, query) = Self::getHookStatus_details(hookGroupId, hookId);
        let body = None;
        let resp = self.client.request(method, &path, query, body).await?;
        Ok(resp.json().await?)
    }

    /// Generate an unsigned URL for the getHookStatus endpoint
    pub fn getHookStatus_url(&self, hookGroupId: &str, hookId: &str) -> Result<String, Error> {
        let (path, query) = Self::getHookStatus_details(hookGroupId, hookId);
        self.client.make_url(&path, query)
    }

    /// Generate a signed URL for the getHookStatus endpoint
    pub fn getHookStatus_signed_url(&self, hookGroupId: &str, hookId: &str, ttl: Duration) -> Result<String, Error> {
        let (path, query) = Self::getHookStatus_details(hookGroupId, hookId);
        self.client.make_signed_url(&path, query, ttl)
    }

    /// Determine the HTTP request details for getHookStatus
    fn getHookStatus_details<'a>(hookGroupId: &'a str, hookId: &'a str) -> (String, Option<Vec<(&'static str, &'a str)>>) {
        let path = format!("hooks/{}/{}/status", urlencode(hookGroupId), urlencode(hookId));
        let query = None;

        (path, query)
    }

    /// Create a hook
    ///
    /// This endpoint will create a new hook.
    ///
    /// The caller's credentials must include the role that will be used to
    /// create the task.  That role must satisfy task.scopes as well as the
    /// necessary scopes to add the task to the queue.
    pub async fn createHook(&self, hookGroupId: &str, hookId: &str, payload: &Value) -> Result<Value, Error> {
        let method = "PUT";
        let (path, query) = Self::createHook_details(hookGroupId, hookId);
        let body = Some(payload);
        let resp = self.client.request(method, &path, query, body).await?;
        Ok(resp.json().await?)
    }

    /// Determine the HTTP request details for createHook
    fn createHook_details<'a>(hookGroupId: &'a str, hookId: &'a str) -> (String, Option<Vec<(&'static str, &'a str)>>) {
        let path = format!("hooks/{}/{}", urlencode(hookGroupId), urlencode(hookId));
        let query = None;

        (path, query)
    }

    /// Update a hook
    ///
    /// This endpoint will update an existing hook.  All fields except
    /// `hookGroupId` and `hookId` can be modified.
    pub async fn updateHook(&self, hookGroupId: &str, hookId: &str, payload: &Value) -> Result<Value, Error> {
        let method = "POST";
        let (path, query) = Self::updateHook_details(hookGroupId, hookId);
        let body = Some(payload);
        let resp = self.client.request(method, &path, query, body).await?;
        Ok(resp.json().await?)
    }

    /// Determine the HTTP request details for updateHook
    fn updateHook_details<'a>(hookGroupId: &'a str, hookId: &'a str) -> (String, Option<Vec<(&'static str, &'a str)>>) {
        let path = format!("hooks/{}/{}", urlencode(hookGroupId), urlencode(hookId));
        let query = None;

        (path, query)
    }

    /// Delete a hook
    ///
    /// This endpoint will remove a hook definition.
    pub async fn removeHook(&self, hookGroupId: &str, hookId: &str) -> Result<(), Error> {
        let method = "DELETE";
        let (path, query) = Self::removeHook_details(hookGroupId, hookId);
        let body = None;
        let resp = self.client.request(method, &path, query, body).await?;
        resp.bytes().await?;
        Ok(())
    }

    /// Determine the HTTP request details for removeHook
    fn removeHook_details<'a>(hookGroupId: &'a str, hookId: &'a str) -> (String, Option<Vec<(&'static str, &'a str)>>) {
        let path = format!("hooks/{}/{}", urlencode(hookGroupId), urlencode(hookId));
        let query = None;

        (path, query)
    }

    /// Trigger a hook
    ///
    /// This endpoint will trigger the creation of a task from a hook definition.
    ///
    /// The HTTP payload must match the hooks `triggerSchema`.  If it does, it is
    /// provided as the `payload` property of the JSON-e context used to render the
    /// task template.
    pub async fn triggerHook(&self, hookGroupId: &str, hookId: &str, payload: &Value) -> Result<Value, Error> {
        let method = "POST";
        let (path, query) = Self::triggerHook_details(hookGroupId, hookId);
        let body = Some(payload);
        let resp = self.client.request(method, &path, query, body).await?;
        Ok(resp.json().await?)
    }

    /// Determine the HTTP request details for triggerHook
    fn triggerHook_details<'a>(hookGroupId: &'a str, hookId: &'a str) -> (String, Option<Vec<(&'static str, &'a str)>>) {
        let path = format!("hooks/{}/{}/trigger", urlencode(hookGroupId), urlencode(hookId));
        let query = None;

        (path, query)
    }

    /// Get a trigger token
    ///
    /// Retrieve a unique secret token for triggering the specified hook. This
    /// token can be deactivated with `resetTriggerToken`.
    pub async fn getTriggerToken(&self, hookGroupId: &str, hookId: &str) -> Result<Value, Error> {
        let method = "GET";
        let (path, query) = Self::getTriggerToken_details(hookGroupId, hookId);
        let body = None;
        let resp = self.client.request(method, &path, query, body).await?;
        Ok(resp.json().await?)
    }

    /// Generate an unsigned URL for the getTriggerToken endpoint
    pub fn getTriggerToken_url(&self, hookGroupId: &str, hookId: &str) -> Result<String, Error> {
        let (path, query) = Self::getTriggerToken_details(hookGroupId, hookId);
        self.client.make_url(&path, query)
    }

    /// Generate a signed URL for the getTriggerToken endpoint
    pub fn getTriggerToken_signed_url(&self, hookGroupId: &str, hookId: &str, ttl: Duration) -> Result<String, Error> {
        let (path, query) = Self::getTriggerToken_details(hookGroupId, hookId);
        self.client.make_signed_url(&path, query, ttl)
    }

    /// Determine the HTTP request details for getTriggerToken
    fn getTriggerToken_details<'a>(hookGroupId: &'a str, hookId: &'a str) -> (String, Option<Vec<(&'static str, &'a str)>>) {
        let path = format!("hooks/{}/{}/token", urlencode(hookGroupId), urlencode(hookId));
        let query = None;

        (path, query)
    }

    /// Reset a trigger token
    ///
    /// Reset the token for triggering a given hook. This invalidates token that
    /// may have been issued via getTriggerToken with a new token.
    pub async fn resetTriggerToken(&self, hookGroupId: &str, hookId: &str) -> Result<Value, Error> {
        let method = "POST";
        let (path, query) = Self::resetTriggerToken_details(hookGroupId, hookId);
        let body = None;
        let resp = self.client.request(method, &path, query, body).await?;
        Ok(resp.json().await?)
    }

    /// Determine the HTTP request details for resetTriggerToken
    fn resetTriggerToken_details<'a>(hookGroupId: &'a str, hookId: &'a str) -> (String, Option<Vec<(&'static str, &'a str)>>) {
        let path = format!("hooks/{}/{}/token", urlencode(hookGroupId), urlencode(hookId));
        let query = None;

        (path, query)
    }

    /// Trigger a hook with a token
    ///
    /// This endpoint triggers a defined hook with a valid token.
    ///
    /// The HTTP payload must match the hooks `triggerSchema`.  If it does, it is
    /// provided as the `payload` property of the JSON-e context used to render the
    /// task template.
    pub async fn triggerHookWithToken(&self, hookGroupId: &str, hookId: &str, token: &str, payload: &Value) -> Result<Value, Error> {
        let method = "POST";
        let (path, query) = Self::triggerHookWithToken_details(hookGroupId, hookId, token);
        let body = Some(payload);
        let resp = self.client.request(method, &path, query, body).await?;
        Ok(resp.json().await?)
    }

    /// Determine the HTTP request details for triggerHookWithToken
    fn triggerHookWithToken_details<'a>(hookGroupId: &'a str, hookId: &'a str, token: &'a str) -> (String, Option<Vec<(&'static str, &'a str)>>) {
        let path = format!("hooks/{}/{}/trigger/{}", urlencode(hookGroupId), urlencode(hookId), urlencode(token));
        let query = None;

        (path, query)
    }

    /// Get information about recent hook fires
    ///
    /// This endpoint will return information about the the last few times this hook has been
    /// fired, including whether the hook was fired successfully or not
    ///
    /// By default this endpoint will return up to 1000 most recent fires in one request.
    pub async fn listLastFires(&self, hookGroupId: &str, hookId: &str, continuationToken: Option<&str>, limit: Option<&str>) -> Result<Value, Error> {
        let method = "GET";
        let (path, query) = Self::listLastFires_details(hookGroupId, hookId, continuationToken, limit);
        let body = None;
        let resp = self.client.request(method, &path, query, body).await?;
        Ok(resp.json().await?)
    }

    /// Generate an unsigned URL for the listLastFires endpoint
    pub fn listLastFires_url(&self, hookGroupId: &str, hookId: &str, continuationToken: Option<&str>, limit: Option<&str>) -> Result<String, Error> {
        let (path, query) = Self::listLastFires_details(hookGroupId, hookId, continuationToken, limit);
        self.client.make_url(&path, query)
    }

    /// Generate a signed URL for the listLastFires endpoint
    pub fn listLastFires_signed_url(&self, hookGroupId: &str, hookId: &str, continuationToken: Option<&str>, limit: Option<&str>, ttl: Duration) -> Result<String, Error> {
        let (path, query) = Self::listLastFires_details(hookGroupId, hookId, continuationToken, limit);
        self.client.make_signed_url(&path, query, ttl)
    }

    /// Determine the HTTP request details for listLastFires
    fn listLastFires_details<'a>(hookGroupId: &'a str, hookId: &'a str, continuationToken: Option<&'a str>, limit: Option<&'a str>) -> (String, Option<Vec<(&'static str, &'a str)>>) {
        let path = format!("hooks/{}/{}/last-fires", urlencode(hookGroupId), urlencode(hookId));
        let mut query = None;
        if let Some(q) = continuationToken {
            query.get_or_insert_with(Vec::new).push(("continuationToken", q));
        }
        if let Some(q) = limit {
            query.get_or_insert_with(Vec::new).push(("limit", q));
        }

        (path, query)
    }

    /// Heartbeat
    ///
    /// Respond with a service heartbeat.
    ///
    /// This endpoint is used to check on backing services this service
    /// depends on.
    pub async fn heartbeat(&self) -> Result<(), Error> {
        let method = "GET";
        let (path, query) = Self::heartbeat_details();
        let body = None;
        let resp = self.client.request(method, path, query, body).await?;
        resp.bytes().await?;
        Ok(())
    }

    /// Generate an unsigned URL for the heartbeat endpoint
    pub fn heartbeat_url(&self) -> Result<String, Error> {
        let (path, query) = Self::heartbeat_details();
        self.client.make_url(path, query)
    }

    /// Generate a signed URL for the heartbeat endpoint
    pub fn heartbeat_signed_url(&self, ttl: Duration) -> Result<String, Error> {
        let (path, query) = Self::heartbeat_details();
        self.client.make_signed_url(path, query, ttl)
    }

    /// Determine the HTTP request details for heartbeat
    fn heartbeat_details<'a>() -> (&'static str, Option<Vec<(&'static str, &'a str)>>) {
        let path = "__heartbeat__";
        let query = None;

        (path, query)
    }
}
