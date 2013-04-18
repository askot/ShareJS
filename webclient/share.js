(function(){var e,t,n,o,i,r,s,l,p,c,u,a,d=[].slice;window.sharejs=l={version:"0.7.0"},"undefined"==typeof WEB&&(window.WEB=!0),c="undefined"!=typeof WEB&&null!==WEB?function(e){return setTimeout(e,0)}:process.nextTick,o=function(){function e(){}return e.prototype.on=function(e,t){var n;return this._events||(this._events={}),(n=this._events)[e]||(n[e]=[]),this._events[e].push(t),this},e.prototype.removeListener=function(e,t){var n,o,i,r=this;for(this._events||(this._events={}),o=(i=this._events)[e]||(i[e]=[]),n=0;o.length>n;)o[n]===t&&(o[n]=void 0),n++;return c(function(){var t;return r._events[e]=function(){var n,o,i,r;for(i=this._events[e],r=[],n=0,o=i.length;o>n;n++)t=i[n],t&&r.push(t);return r}.call(r)}),this},e.prototype.emit=function(){var e,t,n,o,i,r,s;if(t=arguments[0],e=arguments.length>=2?d.call(arguments,1):[],!(null!=(r=this._events)?r[t]:void 0))return"error"===t&&"undefined"!=typeof console&&null!==console&&console.error.apply(console,e),this;for(s=this._events[t],o=0,i=s.length;i>o;o++)n=s[o],n&&n.apply(this,e);return this},e.prototype.once=function(e,t){var n,o=this;return this.on(e,n=function(){var i;return i=arguments.length>=1?d.call(arguments,0):[],o.removeListener(e,n),t.apply(o,i)})},e}(),o.mixin=function(e){var t;return t=e.prototype||e,t.on=o.prototype.on,t.removeListener=o.prototype.removeListener,t.emit=o.prototype.emit,t.once=o.prototype.once,e},("undefined"==typeof WEB||null===WEB)&&(module.exports=o),("undefined"==typeof WEB||null===WEB)&&(a=require("ot-types")),"undefined"!=typeof WEB&&null!==WEB&&(l.extendDoc=function(e,t){return n.prototype[e]=t}),n=function(){function e(e,t,n,o){this.connection=e,this.collection=t,this.name=n,this.subscribed=!1,this.subscribeRequested=!1,this.inflightData=null,this.pendingData=[],"number"==typeof(null!=o?o.v:void 0)&&this._injestData(o)}var t;return e.prototype._send=function(e){return e.c=this.collection,e.doc=this.name,this.connection.send(e)},e.prototype.subscribe=function(e){var t,n=this;if(!this.subscribeRequested&&(this.subscribeRequested=!0,e&&(this._subscribeCallback=function(t){return n._subscribeCallback=null,e(t)}),"disconnected"!==this.connection.state))return t={a:"sub"},"number"==typeof this.version&&(t.v=this.version),this._send(t)},e.prototype.unsubscribe=function(e){var t=this;if(this.subscribeRequested&&(this.subscribeRequested=!1,"disconnected"!==this.connection.state))return e&&(this._unsubscribeCallback=function(n){return t._unsubscribeCallback=null,e(n)}),this._send({a:"unsub"})},e.prototype.fetch=function(e){return e&&this.once("fetched",e),this._send({a:"fetch"})},e.prototype._connectionStateChanged=function(e,t){switch(e){case"disconnected":this.subscribed=!1;break;case"connecting":this.subscribeRequested&&(this.subscribeRequested=!1,this.subscribe()),this.inflightData&&this._sendOpData(this.inflightData)}return this.emit(e,t)},e.prototype._setType=function(e){var t,n,o,i;if("string"==typeof e){if(!a[e])throw Error("Missing type "+e);e=a[e]}if(e&&!e.compose)throw Error("Support for types without compose() is not implemented");if(null!=(o=this.type)?o.api:void 0){this._onOp&&this.removeListener("op",this._onOp);for(t in this.type.api)delete this[t]}if(this.type=e,this.type||(this.snapshot=null),null!=e?!e.api:true)return this.provides={};i=e.api;for(t in i)n=i[t],this[t]=n;return this._onOp?this.on("op",this._onOp):void 0},e.prototype._injestData=function(e){if(null==e&&(e={}),void 0===e.snapshot)throw Error("Missing snapshot");if(void 0===e.type)throw Error("Missing type");return"number"==typeof this.version?("undefined"!=typeof console&&null!==console&&console.warn("Ignoring extra attempt to injest data"),void 0):(this.version=e.v,this.snapshot=e.snapshot,this._setType(e.type))},t=function(e){return delete e.op,delete e.create,delete e.del},e.prototype._xf=function(e,n){var o;if(n.create||n.del)return t(e);if(e.del)return t(n);if(e.create)throw Error("Invalid state. This is a bug. Please file an issue on github");if(n.op&&e.op)return e.type.transformX?(o=e.type.transformX(e.op,n.op),e.op=o[0],n.op=o[1],o):(e.op=this.type.transform(e.op,n.op,"left"),n.op=this.type.transform(n.op,e.op,"right"))},e.prototype._otApply=function(e,t){var n,o,i=this;if(this.locked=!0,n=e.create)return this._setType(n.type),this.snapshot=this.type.create(n.data),setTimeout(function(){return i.emit("ready",t)},0),setTimeout(function(){return i.emit("created",t)},0);if(e.del)return this._setType(null),setTimeout(function(){return i.emit("deleted",t)},0);if(o=e.op){if(!this.type)throw Error("Document does not exist");return o=e.op,this.emit("before op",o,t),this.incremental&&this.type.incrementalApply?this.type.incrementalApply(this.snapshot,o,function(e,n){return i.snapshot=n,i.emit("op",e,t)}):(this.snapshot=this.type.apply(this.snapshot,o),this.emit("op",o,t))}return"undefined"!=typeof console&&null!==console?console.warn("Ignoring received no-op.",e):void 0},e.prototype._afterOtApply=function(e,t){return this.locked=!1,e.op?this.emit("after op",e.op,t):void 0},e.prototype._tryRollback=function(e){var t,n,o,i,r;if(e.create)return this._setType(null);if(e.op&&e.type.invert){for(n=e.type.invert(e.op),r=this.pendingData,o=0,i=r.length;i>o;o++)t=r[o],this._xf(t,n);return this._otApply(n,!1),this._afterOtApply(n,!1)}return this.emit("error","Op apply failed and the operation could not be reverted"),this._setType(null),this.v=null,this.fetch()},e.prototype._opAcknowledged=function(e){var t,n,o,i,r,s;if("Op already submitted"!==o){if(t=this.inflightData,this.inflightData=null,o=e.error)this._tryRollback(t);else{if(e.v!==this.version)throw Error("Invalid version from server. Please file an issue, this is a bug.");this.version++,this.emit("acknowledge",t)}for(s=t.callbacks,i=0,r=s.length;r>i;i++)n=s[i],n(o);return this.flush()}},e.prototype._onMessage=function(e){var t,n,o,i,r,s,l,p;if(e.c!==this.collection||e.doc!==this.name)throw Error("Got message for wrong document. Expected '"+this.collection+"'.'"+this.name+"' but got '"+e.c+"'.'"+e.doc+"'");switch(e.a){case"data":return this._injestData(e),this.type&&this.emit("ready"),this.emit("fetched");case"sub":if(e.error){"undefined"!=typeof console&&null!==console&&console.error("Could not open document: "+e.error),this.emit("error",e.error),this.subscribed=!1,this.subscribeRequested=!1,"function"==typeof this._subscribeCallback&&this._subscribeCallback(e.error);break}return this.subscribed=!0,this.emit("subscribed"),"function"==typeof this._subscribeCallback&&this._subscribeCallback(),this.flush();case"unsub":return this.subscribed=!1,this.emit("unsubscribed"),"function"==typeof this._unsubscribeCallback?this._unsubscribeCallback():void 0;case"ack":if(e.error)return this._opAcknowledged(e);break;case"op":if(this.inflightData&&e.src===this.inflightData.src&&e.seq===this.inflightData.seq){this._opAcknowledged(e);break}if(e.v!==this.version)return this.emit("error","Expected version "+this.version+" but got "+e.v);for(t=e,this.inflightData&&this._xf(this.inflightData,t),l=this.pendingData,r=0,s=l.length;s>r;r++)o=l[r],this._xf(o,t);return this.version++,this._otApply(t,!1),this._afterOtApply(t,!1);case"meta":return p=e.meta,n=p.path,i=p.value,"undefined"!=typeof console&&null!==console?console.warn("Unhandled meta op:",e):void 0;default:return"undefined"!=typeof console&&null!==console?console.warn("Unhandled document message:",e):void 0}},e.prototype._submitOpData=function(e,t){var n,o,i=this;return o=function(e){return t?t(e):"undefined"!=typeof console&&null!==console?console.warn("Failed attempt to submitOp:",e):void 0},this.subscribeRequested?this.locked?o("Cannot call submitOp from inside an 'op' event handler"):(e.op&&(this.type||o("Document has not been created"),null!=this.type.normalize&&(e.op=this.type.normalize(e.op))),this._otApply(e,!0),e.op&&this.pendingData.length&&(n=this.pendingData[this.pendingData.length-1]).op?n.op=this.type.compose(n.op,e.op):(n=e,e.type=this.type,e.callbacks=[],this.pendingData.push(e)),t&&n.callbacks.push(t),this._afterOtApply(e,!0),setTimeout(function(){return i.flush()},0)):o("You cannot currently submit operations to an unsubscribed document")},e.prototype.submitOp=function(e,t){return this._submitOpData({op:e},t)},e.prototype.create=function(e,t,n){var o;return"function"==typeof t&&(o=[void 0,t],t=o[0],n=o[1]),this.type?"function"==typeof n?n("Document already exists"):void 0:this._submitOpData({create:{type:e,data:t}},n)},e.prototype.del=function(e){return this.type?this._submitOpData({del:!0},e):"function"==typeof e?e("Document does not exist"):void 0},e.prototype._sendOpData=function(e){var t;return t={a:"op",v:this.version},e.src&&(t.src=e.src,t.seq=e.seq),e.op&&(t.op=e.op),e.create&&(t.create=e.create),e.del&&(t.del=e.del),this._send(t),e.src?void 0:(e.src=this.connection.id,e.seq=this.connection.seq++)},e.prototype.flush=function(){var e;if(("connecting"===(e=this.connection.state)||"connected"===e)&&null===this.inflightData&&this.pendingData.length)return this.inflightData=this.pendingData.shift(),this._sendOpData(this.inflightData)},e.prototype.getSnapshot=function(){return this.snapshot},e}(),("undefined"==typeof WEB||null===WEB)&&(o=require("./microevent")),o.mixin(n),l.Doc=n,"undefined"!=typeof WEB&&null!==WEB?(a=ottypes,e=window.BCSocket,i=window.SockJS,r=window.WebSocket,u=e?"channel":i?"sockjs":"websocket"):(a=require("ot-types"),e=require("browserchannel").BCSocket,n=require("./doc").Doc,r=require("ws"),u=null),t=function(){function e(e){var t=this;this.socket=e,this.collections={},this.state="disconnected",this.socket.onmessage=function(e){var n,o,i;if(console.log("RECV",e),e.id){if(0!==e.protocol)throw Error("Invalid protocol version");if("string"!=typeof e.id)throw Error("Invalid client id");return t.id=e.id,t.setState("connected"),void 0}return void 0!==e.doc?(n=t.lastReceivedCollection=e.c,i=t.lastReceivedDoc=e.doc):(n=e.c=t.lastReceivedCollection,i=e.doc=t.lastReceivedDoc),(o=t.get(n,i))?o._onMessage(e):"undefined"!=typeof console&&null!==console?console.error("Unhandled message",e):void 0},this.connected=!1,this.socket.onclose=function(e){return t.setState("disconnected",e),"Closed"===e||"Stopped by server"===e?t.setState("stopped",t.lastError||e):void 0},this.socket.onerror=function(e){return t.emit("error",e)},this.socket.onopen=function(){return t.setState("connecting")},this.reset()}return e.prototype._error=function(e){return this.setState("stopped",e),this.disconnect(e)},e.prototype.reset=function(){return this.id=this.lastError=this.lastReceivedDoc=this.lastSentDoc=null,this.seq=1},e.prototype.setState=function(e,t){var n,o,i,r,s,l;if(this.state!==e){if("connecting"===e&&"disconnected"!==this.state||"connected"===e&&"connecting"!==this.state)throw Error("Cannot transition directly from "+this.state+" to "+e);this.state=e,"disconnected"===e&&this.reset(),this.emit(e,t),s=this.collections,l=[];for(n in s)o=s[n],l.push(function(){var n;n=[];for(r in o)i=o[r],n.push(i._connectionStateChanged(e,t));return n}());return l}},e.prototype.send=function(e){var t,n;return console.log("SEND:",e),e.doc&&(n=e.doc,t=e.c,t===this.lastSentCollection&&n===this.lastSentDoc?(delete e.c,delete e.doc):(this.lastSentCollection=t,this.lastSentDoc=n)),this.socket.send(e)},e.prototype.disconnect=function(){return this.socket.close()},e.prototype.get=function(e,t){var n;return null!=(n=this.collections[e])?n[t]:void 0},e.prototype.getOrCreate=function(e,t,o){var i,r;return(i=this.get(e,t))?i:(i=new n(this,e,t,o),e=(r=this.collections)[e]||(r[e]={}),e[t]=i)},e}(),("undefined"==typeof WEB||null===WEB)&&(o=require("./microevent")),o.mixin(t),l.Connection=t,"undefined"!=typeof WEB&&null!==WEB?p=void 0!==window.BCSocket:t=require("./connection").Connection,l.open=function(){var n,o,i;return n={},o=function(o,i){var r,s,l;return"undefined"!=typeof WEB&&null!==WEB&&null==o&&(l=window.location,o=""+l.protocol+"//"+l.host+"/channel"),n[o]||(r=new t(new e(o,{reconnect:!0}),i),s=function(){return delete n[o]},r.on("disconnected",s),r.on("connect failed",s),n[o]=r),n[o]},i=function(e){var t,n,o,i;o=0,i=e.docs;for(n in i)t=i[n],("closed"!==t.state||t.autoOpen)&&o++;return 0===o?e.disconnect():void 0},function(e,t,n,r,s){var l,c,u;if(!p)throw Error("Cannot find browserchannel. If you want to use a custom channel, create a connection manually.");return"function"==typeof r&&(s=r,r={}),"string"==typeof r&&(r={origin:r}),u=r.origin,l=r.authentication,c=o(u,l),c.open(e,t,n,function(e,t){return e?(s(e),i(c)):(t.on("closed",function(){return i(c)}),s(null,t))}),c.on("connect failed"),c}}(),("undefined"==typeof WEB||null===WEB)&&(l.Doc=require("./doc").Doc,l.Connection=require("./connection").Connection),s=function(e,t,n){var o,i;if(t!==n){for(i=0;t.charAt(i)===n.charAt(i);)i++;for(o=0;t.charAt(t.length-1-o)===n.charAt(n.length-1-o)&&t.length>o+i&&n.length>o+i;)o++;return t.length!==i+o&&e.remove(i,t.length-i-o),n.length!==i+o?e.insert(i,n.slice(i,n.length-o)):void 0}},window.sharejs.extendDoc("attach_textarea",function(e){var t,n,o,i,r,l,p;return o=this,p=function(t,n){var o,i;return o=[n(e.selectionStart),n(e.selectionEnd)],i=e.scrollTop,e.value=t,e.scrollTop!==i&&(e.scrollTop=i),window.document.activeElement===e?(e.selectionStart=o[0],e.selectionEnd=o[1],o):void 0},r=function(t,n){var o,i;return i=function(e){return e>t?e+n.length:e},o=e.value.replace(/\r\n/g,"\n"),p(o.slice(0,t)+n+o.slice(t),i)},l=function(t,n){var o,i;return i=function(e){return e>t?e-Math.min(n,e-t):e},o=e.value.replace(/\r\n/g,"\n"),p(o.slice(0,t)+o.slice(t+n),i)},i=function(){var t;return t=function(e){return setTimeout(e,0)},t(function(){var t;return e.value!==t?(t=e.value,s(o,o.getText(),e.value.replace(/\r\n/g,"\n"))):void 0})},t=function(){var t,s,p,c,u;if(!o.provides.text)return"undefined"!=typeof console&&null!==console?console.warn("Could not attach document: text api incompatible"):void 0;for(s=e.value=o.getText(),o.on("insert",r),o.on("remove",l),u=["textInput","keydown","keyup","select","cut","paste"],p=0,c=u.length;c>p;p++)t=u[p],e.addEventListener?e.addEventListener(t,i,!1):e.attachEvent("on"+t,i);return o.once("deleted",n)},n=e.detach_share=function(){var n,s,p,c;for(o.removeListener("insert",r),o.removeListener("remove",l),c=["textInput","keydown","keyup","select","cut","paste"],s=0,p=c.length;p>s;s++)n=c[s],e.removeEventListener?e.removeEventListener(n,i,!1):e.detachEvent("on"+n,i);return e.disabled=!0,o.once("ready",t)},o.type?t():o.once("ready",t)})}).call(this),function(){var e,t,n,o,i,r,s={exports:{}},l=s.exports;l.name="text",l.uri="http://sharejs.org/types/textv1",l.create=function(e){if(null!=e&&"string"!=typeof e)throw Error("Initial data must be a string");return e||""},e=function(e){var t,n,o,i;if(!Array.isArray(e))throw Error("Op must be an array of components");for(n=null,o=0,i=e.length;i>o;o++){switch(t=e[o],typeof t){case"object":if(!("number"==typeof t.d&&t.d>0))throw Error("Object components must be deletes of size > 0");break;case"string":if(!(t.length>0))throw Error("Inserts cannot be empty");break;case"number":if(!(t>0))throw Error("Skip components must be >0");if("number"==typeof n)throw Error("Adjacent skip components should be combined")}n=t}if("number"==typeof n)throw Error("Op has a trailing skip")},n=function(e){return function(t){return t&&0!==t.d?0===e.length?e.push(t):typeof t==typeof e[e.length-1]?"object"==typeof t?e[e.length-1].d+=t.d:e[e.length-1]+=t:e.push(t):void 0}},o=function(e){var t,n,o,i;return t=0,n=0,i=function(o,i){var r,s;return t===e.length?-1===o?null:o:(r=e[t],"number"==typeof r?-1===o||o>=r-n?(s=r-n,++t,n=0,s):(n+=o,o):"string"==typeof r?-1===o||"i"===i||o>=r.length-n?(s=r.slice(n),++t,n=0,s):(s=r.slice(n,n+o),n+=o,s):-1===o||"d"===i||o>=r.d-n?(s={d:r.d-n},++t,n=0,s):(n+=o,{d:o}))},o=function(){return e[t]},[i,o]},t=function(e){return"number"==typeof e?e:e.length||e.d},r=function(e){return e.length>0&&"number"==typeof e[e.length-1]&&e.pop(),e},l.normalize=function(e){var t,o,i,s,l;for(i=[],t=n(i),s=0,l=e.length;l>s;s++)o=e[s],t(o);return r(i)},l.apply=function(t,n){var o,i,r,s,l;if("string"!=typeof t)throw Error("Snapshot should be a string");for(e(n),r=0,i=[],s=0,l=n.length;l>s;s++)switch(o=n[s],typeof o){case"number":if(o>t.length)throw Error("The op is too long for this document");i.push(t.slice(0,o)),t=t.slice(o);break;case"string":i.push(o);break;case"object":t=t.slice(o.d)}return i.join("")+t},l.transform=function(i,s,l){var p,c,u,a,d,h,f,v,g,m,y;if("left"!==l&&"right"!==l)throw Error("side ("+l+") must be 'left' or 'right'");for(e(i),e(s),d=[],p=n(d),y=o(i),v=y[0],f=y[1],g=0,m=s.length;m>g;g++)switch(u=s[g],typeof u){case"number":for(a=u;a>0;)c=v(a,"i"),p(c),"string"!=typeof c&&(a-=t(c));break;case"string":"left"===l&&(h=f(),"string"==typeof h&&p(v(-1))),p(u.length);break;case"object":for(a=u.d;a>0;)switch(c=v(a,"i"),typeof c){case"number":a-=c;break;case"string":p(c);break;case"object":a-=c.d}}for(;u=v(-1);)p(u);return r(d)},l.compose=function(i,s){var l,p,c,u,a,d,h,f,v,g;for(e(i),e(s),a=[],l=n(a),g=o(i),d=g[0],h=g[1],f=0,v=s.length;v>f;f++)switch(c=s[f],typeof c){case"number":for(u=c;u>0;)p=d(u,"d"),l(p),"object"!=typeof p&&(u-=t(p));break;case"string":l(c);break;case"object":for(u=c.d;u>0;)switch(p=d(u,"d"),typeof p){case"number":l({d:p}),u-=p;break;case"string":u-=p.length;break;case"object":l(p)}}for(;c=d(-1);)l(c);return r(a)},i=function(e,t){var n,o,i,r;for(o=0,i=0,r=t.length;r>i&&(n=t[i],!(o>=e));i++)switch(typeof n){case"number":if(o+n>=e)return e;o+=n;break;case"string":o+=n.length,e+=n.length;break;case"object":e-=Math.min(n.d,e-o)}return e},l.transformCursor=function(e,t,n){var o,r,s,l;if(r=0,n){for(s=0,l=t.length;l>s;s++)switch(o=t[s],typeof o){case"number":r+=o;break;case"string":r+=o.length}return[r,r]}return[i(e[0],t),i(e[1],t)]};var p=window.ottypes=window.ottypes||{},c=s.exports;p[c.name]=c,c.uri&&(p[c.uri]=c)}(),function(){var e={exports:{}},t=e.exports;t._bootstrapTransform=function(e,t,n,o){var i,r;return i=function(e,n,o,i){return t(o,e,n,"left"),t(i,n,e,"right")},e.transformX=e.transformX=r=function(e,t){var s,l,p,c,u,a,d,h,f,v,g,m,y,b,w,k,_,E,D;for(n(e),n(t),u=[],v=0,b=t.length;b>v;v++){for(f=t[v],c=[],s=0;e.length>s;){if(a=[],i(e[s],f,c,a),s++,1!==a.length){if(0===a.length){for(E=e.slice(s),g=0,w=E.length;w>g;g++)l=E[g],o(c,l);f=null;break}for(D=r(e.slice(s),a),p=D[0],h=D[1],m=0,k=p.length;k>m;m++)l=p[m],o(c,l);for(y=0,_=h.length;_>y;y++)d=h[y],o(u,d);f=null;break}f=a[0]}null!=f&&o(u,f),e=c}return[e,u]},e.transform=e.transform=function(e,n,o){if("left"!==o&&"right"!==o)throw Error("type must be 'left' or 'right'");return 0===n.length?e:1===e.length&&1===n.length?t([],e[0],n[0],o):"left"===o?r(e,n)[0]:r(n,e)[1]}};var n,o,i,r,s,l,p,c;l={name:"text-old",uri:"http://sharejs.org/types/textv0",create:function(){return""}},s=function(e,t,n){return e.slice(0,t)+n+e.slice(t)},o=function(e){var t,n;if("number"!=typeof e.p)throw Error("component missing position field");if(n=typeof e.i,t=typeof e.d,!("string"===n^"string"===t))throw Error("component needs an i or d field");if(!(e.p>=0))throw Error("position cannot be negative")},i=function(e){var t,n,i;for(n=0,i=e.length;i>n;n++)t=e[n],o(t);return!0},l.apply=function(e,t){var n,o,r,l;for(i(t),r=0,l=t.length;l>r;r++)if(n=t[r],null!=n.i)e=s(e,n.p,n.i);else{if(o=e.slice(n.p,n.p+n.d.length),n.d!==o)throw Error("Delete component '"+n.d+"' does not match deleted text '"+o+"'");e=e.slice(0,n.p)+e.slice(n.p+n.d.length)}return e},l._append=n=function(e,t){var n,o,i;return""!==t.i&&""!==t.d?0===e.length?e.push(t):(n=e[e.length-1],null!=n.i&&null!=t.i&&n.p<=(o=t.p)&&n.p+n.i.length>=o?e[e.length-1]={i:s(n.i,t.p-n.p,t.i),p:n.p}:null!=n.d&&null!=t.d&&t.p<=(i=n.p)&&t.p+t.d.length>=i?e[e.length-1]={d:s(t.d,n.p-t.p,n.d),p:t.p}:e.push(t)):void 0},l.compose=function(e,t){var o,r,s,l;for(i(e),i(t),r=e.slice(),s=0,l=t.length;l>s;s++)o=t[s],n(r,o);return r},l.compress=function(e){return l.compose([],e)},l.normalize=function(e){var t,o,i,r,s;for(o=[],(null!=e.i||null!=e.p)&&(e=[e]),i=0,r=e.length;r>i;i++)t=e[i],null==(s=t.p)&&(t.p=0),n(o,t);return o},c=function(e,t,n){return null!=t.i?e>t.p||t.p===e&&n?e+t.i.length:e:t.p>=e?e:t.p+t.d.length>=e?t.p:e-t.d.length},l.transformCursor=function(e,t,n){var o,i,r,s;for(i="right"===n,r=0,s=t.length;s>r;r++)o=t[r],e=c(e,o,i);return e},l._tc=p=function(e,t,o,r){var s,l,p,u,a,d;if(i([t]),i([o]),null!=t.i)n(e,{i:t.i,p:c(t.p,o,"right"===r)});else if(null!=o.i)d=t.d,t.p<o.p&&(n(e,{d:d.slice(0,o.p-t.p),p:t.p}),d=d.slice(o.p-t.p)),""!==d&&n(e,{d:d,p:t.p+o.i.length});else if(t.p>=o.p+o.d.length)n(e,{d:t.d,p:t.p-o.d.length});else if(t.p+t.d.length<=o.p)n(e,t);else{if(u={d:"",p:t.p},t.p<o.p&&(u.d=t.d.slice(0,o.p-t.p)),t.p+t.d.length>o.p+o.d.length&&(u.d+=t.d.slice(o.p+o.d.length-t.p)),p=Math.max(t.p,o.p),l=Math.min(t.p+t.d.length,o.p+o.d.length),s=t.d.slice(p-t.p,l-t.p),a=o.d.slice(p-o.p,l-o.p),s!==a)throw Error("Delete ops delete different text in the same region of the document");""!==u.d&&(u.p=c(u.p,o),n(e,u))}return e},r=function(e){return null!=e.i?{d:e.i,p:e.p}:{i:e.d,p:e.p}},l.invert=function(e){var t,n,o,i,s;for(i=e.slice().reverse(),s=[],n=0,o=i.length;o>n;n++)t=i[n],s.push(r(t));return s},"undefined"!=typeof window&&null!==window?t._bootstrapTransform(l,l.transformComponent,l.checkValidOp,l.append):require("./helpers")._bootstrapTransform(l,l.transformComponent,l.checkValidOp,l.append),e.exports=l;var u,a,d,l;l="undefined"!=typeof window&&null!==window?e.exports:require("./text-old"),d={name:"json0",uri:"http://sharejs.org/types/JSONv0"},d.create=function(){return null},d.invertComponent=function(e){var t;return t={p:e.p},void 0!==e.si&&(t.sd=e.si),void 0!==e.sd&&(t.si=e.sd),void 0!==e.oi&&(t.od=e.oi),void 0!==e.od&&(t.oi=e.od),void 0!==e.li&&(t.ld=e.li),void 0!==e.ld&&(t.li=e.ld),void 0!==e.na&&(t.na=-e.na),void 0!==e.lm&&(t.lm=e.p[e.p.length-1],t.p=e.p.slice(0,e.p.length-1).concat([e.lm])),t},d.invert=function(e){var t,n,o,i,r;for(i=e.slice().reverse(),r=[],n=0,o=i.length;o>n;n++)t=i[n],r.push(d.invertComponent(t));return r},d.checkValidOp=function(){},a=function(e){return"[object Array]"===Object.prototype.toString.call(e)},d.checkList=function(e){if(!a(e))throw Error("Referenced element not a list")},d.checkObj=function(e){if(e.constructor!==Object)throw Error("Referenced element not an object (it was "+JSON.stringify(e)+")")},d.apply=function(e,t){var n,o,i,r,s,l,p,c,a,h,f,v,g,m;for(d.checkValidOp(t),t=u(t),o={data:e},s=h=0,v=t.length;v>h;s=++h){for(n=t[s],c=null,a=null,r=o,l="data",m=n.p,f=0,g=m.length;g>f;f++)if(p=m[f],c=r,a=l,r=r[l],l=p,null==c)throw Error("Path invalid");if(void 0!==n.na){if("number"!=typeof r[l])throw Error("Referenced element not a number");r[l]+=n.na}else if(void 0!==n.si){if("string"!=typeof r)throw Error("Referenced element not a string (it was "+JSON.stringify(r)+")");c[a]=r.slice(0,l)+n.si+r.slice(l)}else if(void 0!==n.sd){if("string"!=typeof r)throw Error("Referenced element not a string");if(r.slice(l,l+n.sd.length)!==n.sd)throw Error("Deleted string does not match");c[a]=r.slice(0,l)+r.slice(l+n.sd.length)}else if(void 0!==n.li&&void 0!==n.ld)d.checkList(r),r[l]=n.li;else if(void 0!==n.li)d.checkList(r),r.splice(l,0,n.li);else if(void 0!==n.ld)d.checkList(r),r.splice(l,1);else if(void 0!==n.lm)d.checkList(r),n.lm!==l&&(i=r[l],r.splice(l,1),r.splice(n.lm,0,i));else if(void 0!==n.oi)d.checkObj(r),r[l]=n.oi;else{if(void 0===n.od)throw Error("invalid / missing instruction in op");d.checkObj(r),delete r[l]}}return o.data},d.pathMatches=function(e,t,n){var o,i,r,s;if(e.length!==t.length)return!1;for(o=r=0,s=e.length;s>r;o=++r)if(i=e[o],i!==t[o]&&(!n||o!==e.length-1))return!1;return!0},d.append=function(e,t){var n;return t=u(t),0!==e.length&&d.pathMatches(t.p,(n=e[e.length-1]).p)?void 0!==n.na&&void 0!==t.na?e[e.length-1]={p:n.p,na:n.na+t.na}:void 0!==n.li&&void 0===t.li&&t.ld===n.li?void 0!==n.ld?delete n.li:e.pop():void 0!==n.od&&void 0===n.oi&&void 0!==t.oi&&void 0===t.od?n.oi=t.oi:void 0!==t.lm&&t.p[t.p.length-1]===t.lm?null:e.push(t):e.push(t)},d.compose=function(e,t){var n,o,i,r;for(d.checkValidOp(e),d.checkValidOp(t),o=u(e),i=0,r=t.length;r>i;i++)n=t[i],d.append(o,n);return o},d.normalize=function(e){var t,n,o,i,r;for(n=[],a(e)||(e=[e]),o=0,i=e.length;i>o;o++)t=e[o],null==(r=t.p)&&(t.p=[]),d.append(n,t);return n},u=function(e){return JSON.parse(JSON.stringify(e))},d.canOpAffectOp=function(e,t){var n,o,i,r;if(0===e.length)return!0;if(0===t.length)return!1;for(t=t.slice(0,t.length-1),e=e.slice(0,e.length-1),n=i=0,r=e.length;r>i;n=++i){if(o=e[n],n>=t.length)return!1;if(o!==t[n])return!1}return!0},d.transformComponent=function(e,t,n,o){var i,r,s,p,c,a,h,f,v,g,m,y,b,w,k,_,E,D,O;if(t=u(t),void 0!==t.na&&t.p.push(0),void 0!==n.na&&n.p.push(0),d.canOpAffectOp(n.p,t.p)&&(i=n.p.length-1),d.canOpAffectOp(t.p,n.p)&&(r=t.p.length-1),c=t.p.length,v=n.p.length,void 0!==t.na&&t.p.pop(),void 0!==n.na&&n.p.pop(),n.na)return null!=r&&v>=c&&n.p[r]===t.p[r]&&(void 0!==t.ld?(f=u(n),f.p=f.p.slice(c),t.ld=d.apply(u(t.ld),[f])):void 0!==t.od&&(f=u(n),f.p=f.p.slice(c),t.od=d.apply(u(t.od),[f]))),d.append(e,t),e;if(null!=r&&v>c&&t.p[r]===n.p[r]&&(void 0!==t.ld?(f=u(n),f.p=f.p.slice(c),t.ld=d.apply(u(t.ld),[f])):void 0!==t.od&&(f=u(n),f.p=f.p.slice(c),t.od=d.apply(u(t.od),[f]))),null!=i)if(s=c===v,void 0!==n.na);else if(void 0!==n.si||void 0!==n.sd){if(void 0!==t.si||void 0!==t.sd){if(!s)throw Error("must be a string?");for(p=function(e){var t;return t={p:e.p[e.p.length-1]},null!=e.si?t.i=e.si:t.d=e.sd,t},k=p(t),_=p(n),b=[],l._tc(b,k,_,o),D=0,O=b.length;O>D;D++)w=b[D],h={p:t.p.slice(0,i)},h.p.push(w.p),null!=w.i&&(h.si=w.i),null!=w.d&&(h.sd=w.d),d.append(e,h);return e}}else if(void 0!==n.li&&void 0!==n.ld){if(n.p[i]===t.p[i]){if(!s)return e;if(void 0!==t.ld){if(void 0===t.li||"left"!==o)return e;t.ld=u(n.li)}}}else if(void 0!==n.li)void 0!==t.li&&void 0===t.ld&&s&&t.p[i]===n.p[i]?"right"===o&&t.p[i]++:n.p[i]<=t.p[i]&&t.p[i]++,void 0!==t.lm&&s&&n.p[i]<=t.lm&&t.lm++;else if(void 0!==n.ld){if(void 0!==t.lm&&s){if(n.p[i]===t.p[i])return e;y=n.p[i],a=t.p[i],E=t.lm,(E>y||y===E&&E>a)&&t.lm--}if(n.p[i]<t.p[i])t.p[i]--;else if(n.p[i]===t.p[i]){if(c>v)return e;if(void 0!==t.ld){if(void 0===t.li)return e;delete t.ld}}}else if(void 0!==n.lm)if(void 0!==t.lm&&c===v){if(a=t.p[i],E=t.lm,g=n.p[i],m=n.lm,g!==m)if(a===g){if("left"!==o)return e;t.p[i]=m,a===E&&(t.lm=m)}else a>g&&t.p[i]--,a>m?t.p[i]++:a===m&&g>m&&(t.p[i]++,a===E&&t.lm++),E>g?t.lm--:E===g&&E>a&&t.lm--,E>m?t.lm++:E===m&&(m>g&&E>a||g>m&&a>E?"right"===o&&t.lm++:E>a?t.lm++:E===g&&t.lm--)}else void 0!==t.li&&void 0===t.ld&&s?(a=n.p[i],E=n.lm,y=t.p[i],y>a&&t.p[i]--,y>E&&t.p[i]++):(a=n.p[i],E=n.lm,y=t.p[i],y===a?t.p[i]=E:(y>a&&t.p[i]--,y>E?t.p[i]++:y===E&&a>E&&t.p[i]++));else if(void 0!==n.oi&&void 0!==n.od){if(t.p[i]===n.p[i]){if(void 0===t.oi||!s)return e;if("right"===o)return e;t.od=n.oi}}else if(void 0!==n.oi){if(void 0!==t.oi&&t.p[i]===n.p[i]){if("left"!==o)return e;d.append(e,{p:t.p,od:n.oi})}}else if(void 0!==n.od&&t.p[i]===n.p[i]){if(!s)return e;if(void 0===t.oi)return e;delete t.od}return d.append(e,t),e},"undefined"!=typeof window&&null!==window?t._bootstrapTransform(d,d.transformComponent,d.checkValidOp,d.append):require("./helpers")._bootstrapTransform(d,d.transformComponent,d.checkValidOp,d.append),e.exports=d;var h=window.ottypes=window.ottypes||{},f=e.exports;h[f.name]=f,f.uri&&(h[f.uri]=f)}();