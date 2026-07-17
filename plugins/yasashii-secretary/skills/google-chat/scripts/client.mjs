const CHAT_API = "https://chat.googleapis.com/v1";
const PEOPLE_API = "https://people.googleapis.com/v1";

function classifyApiFailure(response) {
  if (response.status === 401) return Object.assign(new Error("Google認証の有効期限が切れています。再認証してください。"), { code: "reauth-required" });
  if (response.status === 403) return Object.assign(new Error("Google Workspace管理者の設定またはscopeにより読み取りが拒否されました。"), { code: "admin-or-scope-blocked" });
  if (response.status === 429) return Object.assign(new Error("Google Chat APIの利用上限に達しました。時間を置いて再実行してください。"), { code: "rate-limit" });
  if (response.status === 404) return Object.assign(new Error("Google Chat APIが無効か、対象スペースへアクセスできません。"), { code: "api-disabled-or-not-found" });
  return Object.assign(new Error("Google Chat APIから取得できませんでした。"), { code: "api-failed" });
}

export function createGoogleChatClient({ accessToken, fetchImpl = fetch, chatBase = CHAT_API, peopleBase = PEOPLE_API }) {
  const request = async (url) => {
    let response;
    try { response = await fetchImpl(url, { headers: { authorization: `Bearer ${accessToken}` } }); }
    catch { throw Object.assign(new Error("Google Chat APIへ接続できません。ネットワークを確認してください。"), { code: "network" }); }
    if (!response.ok) throw classifyApiFailure(response);
    return response.json();
  };
  return {
    async listSpaces() {
      const spaces = [];
      let pageToken = "";
      do {
        const url = new URL(`${chatBase}/spaces`);
        url.searchParams.set("pageSize", "1000");
        if (pageToken) url.searchParams.set("pageToken", pageToken);
        const page = await request(url);
        spaces.push(...(page.spaces || []));
        pageToken = page.nextPageToken || "";
      } while (pageToken);
      return spaces;
    },
    getSpace(name) { return request(`${chatBase}/${name}`); },
    async listAllMessages(parent) {
      const messages = [];
      let pageToken = "";
      do {
        const url = new URL(`${chatBase}/${parent}/messages`);
        url.searchParams.set("pageSize", "100");
        url.searchParams.set("orderBy", "createTime asc");
        if (pageToken) url.searchParams.set("pageToken", pageToken);
        const page = await request(url);
        messages.push(...(page.messages || []));
        pageToken = page.nextPageToken || "";
      } while (pageToken);
      return messages;
    },
    async displayName(senderName) {
      if (!senderName) return null;
      const id = senderName.split("/").pop();
      try {
        const person = await request(`${peopleBase}/people/${encodeURIComponent(id)}?personFields=names`);
        return person.names?.find((item) => item.displayName)?.displayName || null;
      } catch { return null; }
    },
  };
}
