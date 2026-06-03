const API_RELEASE = "auditoria-lixeira-2026-05-28";

function getApiStatus() {
  return {
    status: "ok",
    message: "API online",
    release: API_RELEASE
  };
}

module.exports = {
  API_RELEASE,
  getApiStatus
};
