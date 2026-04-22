const json = r => r.json();

export const api = {
  get:   url       => fetch(url).then(json),
  put:   (url, b)  => fetch(url, { method: 'PUT',   headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(b) }).then(json),
  patch: url       => fetch(url, { method: 'PATCH', headers: { 'Content-Type': 'application/json' } }).then(json),
  del:   url       => fetch(url, { method: 'DELETE' }).then(json),
  post:  (url, b)  => fetch(url, { method: 'POST',  headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(b) }).then(json),
};
