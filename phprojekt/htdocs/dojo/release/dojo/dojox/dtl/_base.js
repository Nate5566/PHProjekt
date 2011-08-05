/*
	Copyright (c) 2004-2011, The Dojo Foundation All Rights Reserved.
	Available via Academic Free License >= 2.1 OR the modified BSD license.
	see: http://dojotoolkit.org/license for details
*/


dojo._hasResource["dojox.dtl._base"]||(dojo._hasResource["dojox.dtl._base"]=!0,dojo.provide("dojox.dtl._base"),dojo.require("dojox.string.Builder"),dojo.require("dojox.string.tokenize"),dojo.experimental("dojox.dtl"),function(){var d=dojox.dtl;d.TOKEN_BLOCK=-1;d.TOKEN_VAR=-2;d.TOKEN_COMMENT=-3;d.TOKEN_TEXT=3;d._Context=dojo.extend(function(a){if(a&&(dojo._mixin(this,a),a.get))this._getter=a.get,delete this.get},{push:function(){var a=this,c=dojo.delegate(this);c.pop=function(){return a};return c},
pop:function(){throw Error("pop() called on empty Context");},get:function(a,c){var b=this._normalize;if(this._getter){var d=this._getter(a);if(typeof d!="undefined")return b(d)}return typeof this[a]!="undefined"?b(this[a]):c},_normalize:function(a){if(a instanceof Date)a.year=a.getFullYear(),a.month=a.getMonth()+1,a.day=a.getDate(),a.date=a.year+"-"+("0"+a.month).slice(-2)+"-"+("0"+a.day).slice(-2),a.hour=a.getHours(),a.minute=a.getMinutes(),a.second=a.getSeconds(),a.microsecond=a.getMilliseconds();
return a},update:function(a){var c=this.push();a&&dojo._mixin(this,a);return c}});var k=/("(?:[^"\\]*(?:\\.[^"\\]*)*)"|'(?:[^'\\]*(?:\\.[^'\\]*)*)'|[^\s]+)/g,l=/\s+/g,m=function(a,c){a=a||l;a instanceof RegExp||(a=RegExp(a,"g"));if(!a.global)throw Error("You must use a globally flagged RegExp with split "+a);a.exec("");for(var b,d=[],f=0,g=0;b=a.exec(this);)if(d.push(this.slice(f,a.lastIndex-b[0].length)),f=a.lastIndex,c&&++g>c-1)break;d.push(this.slice(f));return d};d.Token=function(a,c){this.token_type=
a;this.contents=new String(dojo.trim(c));this.contents.split=m;this.split=function(){return String.prototype.split.apply(this.contents,arguments)}};d.Token.prototype.split_contents=function(a){for(var c,b=[],d=0,a=a||999;d++<a&&(c=k.exec(this.contents));)c=c[0],c.charAt(0)=='"'&&c.slice(-1)=='"'?b.push('"'+c.slice(1,-1).replace('\\"','"').replace("\\\\","\\")+'"'):c.charAt(0)=="'"&&c.slice(-1)=="'"?b.push("'"+c.slice(1,-1).replace("\\'","'").replace("\\\\","\\")+"'"):b.push(c);return b};var h=d.text=
{_get:function(a,c,b){a=d.register.get(a,c.toLowerCase(),b);if(!a){if(!b)throw Error("No tag found for "+c);return null}b=a[1];a=a[2];b.indexOf(":")!=-1&&(b=b.split(":"),b=b.pop());dojo.require(a);a=dojo.getObject(a);return a[b||c]||a[c+"_"]||a[b+"_"]},getTag:function(a,c){return h._get("tag",a,c)},getFilter:function(a,c){return h._get("filter",a,c)},getTemplate:function(a){return new d.Template(h.getTemplateString(a))},getTemplateString:function(a){return dojo._getText(a.toString())||""},_resolveLazy:function(a,
c,b){return c?b?dojo.fromJson(dojo._getText(a))||{}:d.text.getTemplateString(a):dojo.xhrGet({handleAs:b?"json":"text",url:a})},_resolveTemplateArg:function(a,c){if(h._isTemplate(a)){if(!c){var b=new dojo.Deferred;b.callback(a);return b}return a}return h._resolveLazy(a,c)},_isTemplate:function(a){return typeof a=="undefined"||typeof a=="string"&&(a.match(/^\s*[<{]/)||a.indexOf(" ")!=-1)},_resolveContextArg:function(a,c){if(a.constructor==Object){if(!c){var b=new dojo.Deferred;b.callback(a);return b}return a}return h._resolveLazy(a,
c,!0)},_re:/(?:\{\{\s*(.+?)\s*\}\}|\{%\s*(load\s*)?(.+?)\s*%\})/g,tokenize:function(a){return dojox.string.tokenize(a,h._re,h._parseDelims)},_parseDelims:function(a,c,b){if(a)return[d.TOKEN_VAR,a];else if(c){a=dojo.trim(b).split(/\s+/g);for(c=0;b=a[c];c++)dojo.require(b)}else return[d.TOKEN_BLOCK,b]}};d.Template=dojo.extend(function(a,c){var b=c?a:h._resolveTemplateArg(a,!0)||"",b=h.tokenize(b);this.nodelist=(new d._Parser(b)).parse()},{update:function(a,c){return h._resolveContextArg(c).addCallback(this,
function(b){var c=this.render(new d._Context(b));a.forEach?a.forEach(function(a){a.innerHTML=c}):dojo.byId(a).innerHTML=c;return this})},render:function(a,c){c=c||this.getBuffer();a=a||new d._Context({});return this.nodelist.render(a,c)+""},getBuffer:function(){dojo.require("dojox.string.Builder");return new dojox.string.Builder}});var n=/\{\{\s*(.+?)\s*\}\}/g;d.quickFilter=function(a){if(!a)return new d._NodeList;if(a.indexOf("{%")==-1)return new d._QuickNodeList(dojox.string.tokenize(a,n,function(a){return new d._Filter(a)}))};
d._QuickNodeList=dojo.extend(function(a){this.contents=a},{render:function(a,c){for(var b=0,d=this.contents.length;b<d;b++)c=this.contents[b].resolve?c.concat(this.contents[b].resolve(a)):c.concat(this.contents[b]);return c},dummyRender:function(a){return this.render(a,d.Template.prototype.getBuffer()).toString()},clone:function(){return this}});d._Filter=dojo.extend(function(a){if(!a)throw Error("Filter must be called with variable name");this.contents=a;var c=this._cache[a];c?(this.key=c[0],this.filters=
c[1]):(this.filters=[],dojox.string.tokenize(a,this._re,this._tokenize,this),this._cache[a]=[this.key,this.filters])},{_cache:{},_re:/(?:^_\("([^\\"]*(?:\\.[^\\"])*)"\)|^"([^\\"]*(?:\\.[^\\"]*)*)"|^([a-zA-Z0-9_.]+)|\|(\w+)(?::(?:_\("([^\\"]*(?:\\.[^\\"])*)"\)|"([^\\"]*(?:\\.[^\\"]*)*)"|([a-zA-Z0-9_.]+)|'([^\\']*(?:\\.[^\\']*)*)'))?|^'([^\\']*(?:\\.[^\\']*)*)')/g,_values:{0:'"',1:'"',2:"",8:'"'},_args:{4:'"',5:'"',6:"",7:"'"},_tokenize:function(){for(var a,c,b=0,d=[];b<arguments.length;b++)d[b]=typeof arguments[b]!=
"undefined"&&typeof arguments[b]=="string"&&arguments[b];if(this.key){for(a in this._args)if(d[a]){c=arguments[a];this._args[a]=="'"?c=c.replace(/\\'/g,"'"):this._args[a]=='"'&&(c=c.replace(/\\"/g,'"'));c=[!this._args[a],c];break}a=h.getFilter(arguments[3]);if(!dojo.isFunction(a))throw Error(arguments[3]+" is not registered as a filter");this.filters.push([a,c])}else for(a in this._values)if(d[a]){this.key=this._values[a]+arguments[a]+this._values[a];break}},getExpression:function(){return this.contents},
resolve:function(a){if(typeof this.key=="undefined")return"";for(var c=this.resolvePath(this.key,a),b=0,d;d=this.filters[b];b++)c=d[1]?d[1][0]?d[0](c,this.resolvePath(d[1][1],a)):d[0](c,d[1][1]):d[0](c);return c},resolvePath:function(a,c){var b,e;b=a.charAt(0);e=a.slice(-1);if(isNaN(parseInt(b)))if(b=='"'&&b==e)b=a.slice(1,-1);else{if(a=="true")return!0;if(a=="false")return!1;if(a=="null"||a=="None")return null;e=a.split(".");b=c.get(e[0]);if(dojo.isFunction(b)){var f=c.getThis&&c.getThis();b=b.alters_data?
"":f?b.call(f):""}for(f=1;f<e.length;f++){var g=e[f];if(b){var h=b;if(dojo.isObject(b)&&g=="items"&&typeof b[g]=="undefined"){var g=[],j;for(j in b)g.push([j,b[j]]);b=g}else{if(b.get&&dojo.isFunction(b.get)&&b.get.safe)b=b.get(g);else if(typeof b[g]=="undefined"){b=b[g];break}else b=b[g];dojo.isFunction(b)?b=b.alters_data?"":b.call(h):b instanceof Date&&(b=d._Context.prototype._normalize(b))}}else return""}}else b=a.indexOf(".")==-1?parseInt(a):parseFloat(a);return b}});d._TextNode=d._Node=dojo.extend(function(a){this.contents=
a},{set:function(a){this.contents=a;return this},render:function(a,c){return c.concat(this.contents)},isEmpty:function(){return!dojo.trim(this.contents)},clone:function(){return this}});d._NodeList=dojo.extend(function(a){this.contents=a||[];this.last=""},{push:function(a){this.contents.push(a);return this},concat:function(a){this.contents=this.contents.concat(a);return this},render:function(a,c){for(var b=0;b<this.contents.length;b++)if(c=this.contents[b].render(a,c),!c)throw Error("Template must return buffer");
return c},dummyRender:function(a){return this.render(a,d.Template.prototype.getBuffer()).toString()},unrender:function(a,c){return c},clone:function(){return this},rtrim:function(){for(;;)if(i=this.contents.length-1,this.contents[i]instanceof d._TextNode&&this.contents[i].isEmpty())this.contents.pop();else break;return this}});d._VarNode=dojo.extend(function(a){this.contents=new d._Filter(a)},{render:function(a,c){var b=this.contents.resolve(a);b.safe||(b=d._base.escape(""+b));return c.concat(b)}});
d._noOpNode=new function(){this.render=this.unrender=function(a,c){return c};this.clone=function(){return this}};d._Parser=dojo.extend(function(a){this.contents=a},{i:0,parse:function(a){for(var c={},b,a=a||[],e=0;e<a.length;e++)c[a[e]]=!0;for(e=new d._NodeList;this.i<this.contents.length;)if(b=this.contents[this.i++],typeof b=="string")e.push(new d._TextNode(b));else{var f=b[0];b=b[1];if(f==d.TOKEN_VAR)e.push(new d._VarNode(b));else if(f==d.TOKEN_BLOCK){if(c[b])return--this.i,e;var g=b.split(/\s+/g);
g.length&&(g=g[0],(g=h.getTag(g))&&e.push(g(this,new d.Token(f,b))))}}if(a.length)throw Error("Could not find closing tag(s): "+a.toString());this.contents.length=0;return e},next_token:function(){var a=this.contents[this.i++];return new d.Token(a[0],a[1])},delete_first_token:function(){this.i++},skip_past:function(a){for(;this.i<this.contents.length;){var c=this.contents[this.i++];if(c[0]==d.TOKEN_BLOCK&&c[1]==a)return}throw Error("Unclosed tag found when looking for "+a);},create_variable_node:function(a){return new d._VarNode(a)},
create_text_node:function(a){return new d._TextNode(a||"")},getTemplate:function(a){return new d.Template(a)}});d.register={_registry:{attributes:[],tags:[],filters:[]},get:function(a,c){for(var b=d.register._registry[a+"s"],e=0,f;f=b[e];e++)if(typeof f[0]=="string"){if(f[0]==c)return f}else if(c.match(f[0]))return f},getAttributeTags:function(){for(var a=[],c=d.register._registry.attributes,b=0,e;e=c[b];b++)if(e.length==3)a.push(e);else{var f=dojo.getObject(e[1]);f&&dojo.isFunction(f)&&(e.push(f),
a.push(e))}return a},_any:function(a,c,b){for(var e in b)for(var f=0,g;g=b[e][f];f++){var h=g;dojo.isArray(g)&&(h=g[0],g=g[1]);if(typeof h=="string"){if(h.substr(0,5)=="attr:"){var j=g;j.substr(0,5)=="attr:"&&(j=j.slice(5));d.register._registry.attributes.push([j.toLowerCase(),c+"."+e+"."+j])}h=h.toLowerCase()}d.register._registry[a].push([h,g,c+"."+e])}},tags:function(a,c){d.register._any("tags",a,c)},filters:function(a,c){d.register._any("filters",a,c)}};var o=/&/g,p=/</g,q=/>/g,r=/'/g,s=/"/g;d._base.escape=
function(a){return d.mark_safe(a.replace(o,"&amp;").replace(p,"&lt;").replace(q,"&gt;").replace(s,"&quot;").replace(r,"&#39;"))};d._base.safe=function(a){typeof a=="string"&&(a=new String(a));if(typeof a=="object")a.safe=!0;return a};d.mark_safe=d._base.safe;d.register.tags("dojox.dtl.tag",{date:["now"],logic:["if","for","ifequal","ifnotequal"],loader:["extends","block","include","load","ssi"],misc:["comment","debug","filter","firstof","spaceless","templatetag","widthratio","with"],loop:["cycle",
"ifchanged","regroup"]});d.register.filters("dojox.dtl.filter",{dates:["date","time","timesince","timeuntil"],htmlstrings:["linebreaks","linebreaksbr","removetags","striptags"],integers:["add","get_digit"],lists:["dictsort","dictsortreversed","first","join","length","length_is","random","slice","unordered_list"],logic:["default","default_if_none","divisibleby","yesno"],misc:["filesizeformat","pluralize","phone2numeric","pprint"],strings:["addslashes","capfirst","center","cut","fix_ampersands","floatformat",
"iriencode","linenumbers","ljust","lower","make_list","rjust","slugify","stringformat","title","truncatewords","truncatewords_html","upper","urlencode","urlize","urlizetrunc","wordcount","wordwrap"]});d.register.filters("dojox.dtl",{_base:["escape","safe"]})}());