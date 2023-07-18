/*! jQuery v3.4.1 | (c) JS Foundation and other contributors | jquery.org/license */
function parse_query_string(n) {
  for (var t, f, u = n.split("&"), i = {}, r = 0; r < u.length; r++)
      t = u[r].split("="),
      typeof i[t[0]] == "undefined" ? i[t[0]] = decodeURIComponent(t[1]) : typeof i[t[0]] == "string" ? (f = [i[t[0]], decodeURIComponent(t[1])],
      i[t[0]] = f) : i[t[0]].push(decodeURIComponent(t[1]));
  return i
}
function openNav() {
  $(".topnav").toggleClass("responsive")
}
function ksearchvideo() {
  var n = $("#s_input").val().trim();
  return n && $.ajax({
      type: "POST",
      url: k_url_search,
      data: {
          q: n,
          vt: k_page
      },
      beforeSend: function() {
          $("#loader-wrapper").css("display", "block");
          $("#search-form").css("display", "none");
          $("#search-result").empty()
      },
      success: function(n, t, i) {
          i.status != 200 && setTimeout(function() {
              window.location.reload()
          }, 3e3);
          n.status == "ok" ? (n.p === "search" ? renderListVideo(n.items) : n.p !== "convert" || n.mess ? n.p === "facebook" ? n.mess ? renderFail(n.mess) : (k_vdata = n,
          renderFacebook(n)) : n.mess && renderFail(n.mess) : (k__token = n.token,
          k_time = n.timeExpires,
          renderDetail(n)),
          $("#loader-wrapper").css("display", "none")) : setTimeout(function() {
              window.location.reload()
          }, 3e3)
      },
      error: function(n) {
          return n.status == 429 ? convertFailed(txt_error_429) : convertFailed(txt_error_404)
      }
  }),
  !1
}
function k_parseDuration(n) {
  var i;
  if (!n)
      return "";
  var r = []
    , t = 0
    , f = n.match(/(?:(\d*)Y)?(?:(\d*)M)?(?:(\d*)W)?(?:(\d*)D)?T(?:(\d*)H)?(?:(\d*)M)?(?:(\d*)S)?/i)
    , u = [{
      pos: 1,
      multiplier: 31536e3
  }, {
      pos: 2,
      multiplier: 2592e3
  }, {
      pos: 3,
      multiplier: 604800
  }, {
      pos: 4,
      multiplier: 86400
  }, {
      pos: 5,
      multiplier: 3600
  }, {
      pos: 6,
      multiplier: 60
  }, {
      pos: 7,
      multiplier: 1
  }];
  if (null === f)
      return "";
  for (i = 0; i < u.length; i++)
      void 0 !== f[u[i].pos] && (t += parseInt(f[u[i].pos]) * u[i].multiplier);
  return 3599 < t && (r.push(parseInt(t / 3600)),
  t %= 3600),
  r.push(("0" + parseInt(t / 60)).slice(-2)),
  r.push(("0" + t % 60).slice(-2)),
  r.join(":")
}
function matchYoutubeUrl(n) {
  var t = /^(?:https?:\/\/)?(?:m\.|www\.)?(?:youtu\.be\/|youtube\.com\/(?:embed\/|v\/|watch\?v=|watch\?.+&v=))((\w|-){11})(?:\S+)?$/;
  return n.match(t) ? n.match(t)[1] : !1
}
function fancyTimeFormat(n) {
  var i = ~~(n / 3600)
    , r = ~~(n % 3600 / 60)
    , u = ~~n % 60
    , t = "";
  return i > 0 && (t += "" + i + ":" + (r < 10 ? "0" : "")),
  t += "" + r + ":" + (u < 10 ? "0" : ""),
  t + ("" + u)
}
function renderFail(n) {
  $("#loader-wrapper").css("display", "none");
  $("#search-form").css("display", "block");
  var t = '<div class="error"><p>' + n + "<\/p><\/div>";
  $("#search-result").html(t)
}
function renderListVideo(n) {
  var t, i, r, u;
  if (n.length) {
      for (i = $("<ul>", {
          "class": "listvideo"
      }),
      t = 0; t < n.length; ++t)
          item = n[t],
          r = c_url_tmp + yt_tmp + item.v,
          u = '<li> <a  href="' + r + '" title="' + item.t + '" target="_blank"><div class="img-thumb"><img src="https://i.ytimg.com/vi/' + item.v + '/mqdefault.jpg" width="100%" height="100%"  alt="yt5s youtube downloader"/><span class="time">' + item.d + '<\/span><\/div> <div class="content"><div class="clearfix"><h3>' + item.t + "<\/h3><\/div><\/div><\/a><\/li>",
          i.append(u);
      $("#search-result").html(i)
  }
}
function convertSuccess(n) {
  $("#mesg-convert").addClass("hidden");
  $("#asuccess").attr("href", n).removeClass("hidden");
  $("#cnext").removeClass("hidden")
}
function convertFailed(n) {
  renderFail(n)
}
function checkTask(n) {
  $.ajax({
      type: "POST",
      url: k_url_check_task,
      data: {
          vid: $("#video_id").val(),
          b_id: n
      },
      success: function(t, i, r) {
          r.status != 200 ? checkTask(n) : t.c_status == "CONVERTED" ? convertSuccess(t.dlink) : t.c_status == "FAILED" ? convertFailed(t.mess) : setTimeout(function() {
              checkTask(n)
          }, 5e3)
      },
      error: function() {
          checkTask(n)
      }
  })
}
function convertFile(n) {
  var n = $("#formatSelect").find(":selected")
    , t = n.data("format")
    , i = n.val();
  $.ajax({
      type: "POST",
      url: k_url_convert,
      headers: {
          "X-Requested-Key": "de0cfuirtgf67a"
      },
      data: {
          v_id: $("#video_id").val(),
          ftype: t,
          fquality: i,
          token: k__token,
          timeExpire: k_time,
          client: k_prefix_name
      },
      beforeSend: function() {
          $("#formatSelect").addClass("hidden");
          $("#btn-action").addClass("hidden");
          $("#mesg-convert").removeClass("hidden")
      },
      success: function(n) {
          if (typeof n.c_status == "undefined")
              return convertFailed(txt_error_404);
          if (n.c_status == "ok" && typeof n.c_server != "undefined")
              convert_Server(n.c_server, t, i);
          else
              return n.c_status == "ok" && typeof n.d_url != "undefined" ? typeof n.checkLink != "undefined" ? getLink_Server(n.d_url) : convertSuccess(n.d_url) : convertFailed(txt_error_404)
      },
      error: function() {
          return convertFailed(txt_error_500)
      }
  })
}
function getLink_Server(n) {
  $.ajax({
      type: "GET",
      url: n,
      success: function(n) {
          if (typeof n.c_status == "undefined")
              return convertFailed(txt_error_404);
          if (n.c_status == "ok")
              convertSuccess(n.link);
          else
              return convertFailed(txt_error_404)
      },
      error: function() {
          return convertFailed(txt_error_500)
      }
  })
}
function convert_Server(n, t, i) {
  $.ajax({
      type: "POST",
      url: n + "/api/json/convert",
      data: {
          v_id: $("#video_id").val(),
          ftype: t,
          fquality: i,
          fname: $("#video_fn").val(),
          token: $("#c_token").val(),
          timeExpire: $("#c_time").val()
      },
      success: function(t) {
          return typeof t.status == "undefined" ? convertFailed(txt_error_404) : t.status == "success" ? t.statusCode == 200 ? convertSuccess(t.result) : t.statusCode == 300 && typeof t.jobId != "undefined" ? WSCheckStatus(n, t.jobId) : convertFailed(getStatusText(t.statusCode)) : convertFailed(txt_error_404)
      },
      error: function() {
          return convertFailed(txt_error_500)
      }
  })
}
function WSCheckStatus(n, t) {
  const i = new URL(n);
  var r = i.protocol == "https:" ? "wss:" : "ws:"
    , u = r + "//" + i.host + "/sub/" + t + "?fname=" + k_prefix_name;
  socket = new WebSocket(u);
  socket.onmessage = function(n) {
      var t = JSON.parse(n.data);
      t.action == "success" && convertSuccess(t.url);
      t.action == "progress" ? UpdateProgress(t.value) : t.action == "error" && convertFailed(txt_error_500)
  }
  ;
  socket.onerror = function() {
      convertFailed(txt_error_404)
  }
}
function UpdateProgress(n) {
  var t = $("#mesg-convert span");
  t.removeClass("lds-dual-ring");
  t.text(n + "%")
}
function getStatusText(n) {
  var t = "";
  return n == 500 ? t = txt_error_500 : n == 400 ? t = txt_error_404 : n == 300 && (t = txt_convert_next),
  t
}
function randomIntFromInterval(n, t) {
  return Math.floor(Math.random() * (t - n + 1) + n)
}
function renderDetail(n) {
  var t = '<div class="detail"><div class="thumbnail"><input type="hidden" id="video_id" value="' + n.vid + '" /><input type="hidden" id="video_fn" value="' + escapeHtml(n.fn) + '" /><input type="hidden" id="c_token" value="' + n.token + '" /><input type="hidden" id="c_time" value="' + n.timeExpires + '" />\n<img src="https://i.ytimg.com/vi/' + n.vid + '/0.jpg">\n<div class="content"><div class="clearfix">\n<h3>' + n.title + "<\/h3>\n<p>" + n.a + '<\/p>\n<p class="mag0">' + fancyTimeFormat(n.t) + "<\/p>";
  t += '<div class="magT10"> <div class="flex">';
  n.links != undefined && n.links != null ? (t += renderSelectQuality(n.links),
  t += '<button id="btn-action" class="btn-blue-small form-control" type="button" onclick="convertFile(0)">Get link<\/button>') : t += '<div class="error"><p>The live video cannot be processed. Please try again later.<\/p><\/div>';
  t += '<span id="mesg-convert" class="form-control mesg-convert hidden"> <span class="lds-dual-ring"><\/span> ' + txt_processing + '<\/span><a id="asuccess" class="form-control mesg-convert success hidden" rel="nofollow" href="#"> ' + txt_download + ' <\/a> &nbsp &nbsp<a id="cnext" class="form-control mesg-convert hidden" href="' + k_url_next + '">' + txt_convert_next + '<\/a><\/div><br/><br/><br/> <div class="addthis_inline_share_toolbox"><\/div> <\/div><\/div><\/div><\/div> ';
  $("#search-result").html(t);
  n.kc != undefined && n.kc != null && convertFile(n.kc)
}
function escapeHtml(n) {
  "use strict";
  return n.replace(/[\"&'\/<>]/g, function(n) {
      return {
          "'": "&#39;",
          "/": "&#47;",
          '"': "&quot;",
          "&": "&amp;",
          "<": "&lt;",
          ">": "&gt;"
      }[n]
  })
}
function KHtmlEncode(n) {
  var t = document.createElement("div");
  return t.innerText = t.textContent = n,
  t.innerHTML
}
function selectFileQuality(n) {
  if (k_vdata.links != undefined && k_vdata.links != null && k_vdata.links.hasOwnProperty(n)) {
      var t = k_vdata.title;
      $("#asuccess").attr("href", k_vdata.links[n]);
      $("#asuccess").attr("download", t + "_" + n + ".mp4")
  }
}
function renderFacebook(n) {
  var t;
  if (n.thumbnail = n.thumbnail ? n.thumbnail : "https://i.ytimg.com/vi/1/0.jpg",
  t = '<div class="detail"><div class="thumbnail">\n<img src="' + n.thumbnail + '">\n<div class="content"><div class="clearfix">\n<h3>' + n.title + '<\/h3>\n<p class="mag0">' + n.duration + "<\/p>",
  t += '<div class="magT10"> <div class="flex">',
  n.links != undefined && n.links != null) {
      t += '<select name="formatSelect" class="form-control form-control-small" id="formatSelect">';
      var r = ""
        , i = !1
        , u = n.title;
      n.links.hd != undefined && n.links.hd != null && (r += '<option value="hd" onclick="selectFileQuality(\'hd\')" >MP4 HD<\/option>',
      i || (i = n.links.hd,
      u += "_hd.mp4"));
      n.links.sd != undefined && n.links.sd != null && (r += '<option value="sd" onclick="selectFileQuality(\'sd\')" >MP4 SD<\/option>',
      i || (i = n.links.sd,
      u += "_sd.mp4"));
      n.links.audio != undefined && n.links.audio != null && (r += '<option value="audio" onclick="selectFileQuality(\'audio\')" >MP3<\/option>',
      i || (i = n.links.audio,
      u += "_audio.mp4"));
      t += r + "<\/select>";
      t += '<a id="asuccess" class="form-control mesg-convert success" target="_blank" rel="nofollow" href="' + i + '" download="' + u + '" data-type="mp4">' + txt_download + "<\/a>"
  }
  t += '<\/div><br/><br/><br/> <div class="addthis_inline_share_toolbox"><\/div> <\/div><\/div><\/div><\/div> ';
  $("#search-result").html(t);
  $("#formatSelect").change(function() {
      selectFileQuality(this.value)
  })
}
function renderSelectQuality(n) {
  var t = '<select class="form-control form-control-small" id="formatSelect">';
  return $.each({
      mp4: ["1080", "720", "480", "360", "240", "144"],
      "3gp": ["144"],
      ogg: ["128kbps"],
      mp3: ["320kbps", "256kbps", "192kbps", "128kbps", "64kbps"]
  }, function(i, r) {
      n[i] !== undefined && (t += '<optgroup label="' + i + '">',
      $.each(r, function(r, u) {
          $.each(n[i], function(n, i) {
              u == i.key && (t += '<option data-format="' + i.f + '" value="' + i.k + '" ' + (typeof i.selected != "undefined" && i.selected == "selected" ? "selected" : "") + ">" + i.q + " (" + i.size + ") <\/option>")
          })
      }),
      t += "<\/optgroup>")
  }),
  t += "<\/select>"
}
!function(n, t) {
  "use strict";
  "object" == typeof module && "object" == typeof module.exports ? module.exports = n.document ? t(n, !0) : function(n) {
      if (!n.document)
          throw new Error("jQuery requires a window with a document");
      return t(n)
  }
  : t(n)
}("undefined" != typeof window ? window : this, function(n, t) {
  "use strict";
  function br(n, t, i) {
      var r, e, u = (i = i || f).createElement("script");
      if (u.text = n,
      t)
          for (r in ee)
              (e = t[r] || t.getAttribute && t.getAttribute(r)) && u.setAttribute(r, e);
      i.head.appendChild(u).parentNode.removeChild(u)
  }
  function it(n) {
      return null == n ? n + "" : "object" == typeof n || "function" == typeof n ? ri[pr.call(n)] || "object" : typeof n
  }
  function pi(n) {
      var t = !!n && "length"in n && n.length
        , i = it(n);
      return !u(n) && !tt(n) && ("array" === i || 0 === t || "number" == typeof t && 0 < t && t - 1 in n)
  }
  function c(n, t) {
      return n.nodeName && n.nodeName.toLowerCase() === t.toLowerCase()
  }
  function bi(n, t, r) {
      return u(t) ? i.grep(n, function(n, i) {
          return !!t.call(n, i, n) !== r
      }) : t.nodeType ? i.grep(n, function(n) {
          return n === t !== r
      }) : "string" != typeof t ? i.grep(n, function(n) {
          return -1 < ii.call(t, n) !== r
      }) : i.filter(t, n, r)
  }
  function uu(n, t) {
      while ((n = n[t]) && 1 !== n.nodeType)
          ;
      return n
  }
  function ut(n) {
      return n
  }
  function fi(n) {
      throw n;
  }
  function fu(n, t, i, r) {
      var f;
      try {
          n && u(f = n.promise) ? f.call(n).done(t).fail(i) : n && u(f = n.then) ? f.call(n, t, i) : t.apply(void 0, [n].slice(r))
      } catch (n) {
          i.apply(void 0, [n])
      }
  }
  function oi() {
      f.removeEventListener("DOMContentLoaded", oi);
      n.removeEventListener("load", oi);
      i.ready()
  }
  function ce(n, t) {
      return t.toUpperCase()
  }
  function y(n) {
      return n.replace(se, "ms-").replace(he, ce)
  }
  function pt() {
      this.expando = i.expando + pt.uid++
  }
  function ou(n, t, i) {
      var u, r;
      if (void 0 === i && 1 === n.nodeType)
          if (u = "data-" + t.replace(ae, "-$&").toLowerCase(),
          "string" == typeof (i = n.getAttribute(u))) {
              try {
                  i = "true" === (r = i) || "false" !== r && ("null" === r ? null : r === +r + "" ? +r : le.test(r) ? JSON.parse(r) : r)
              } catch (n) {}
              o.set(n, t, i)
          } else
              i = void 0;
      return i
  }
  function hu(n, t, r, u) {
      var s, h, c = 20, l = u ? function() {
          return u.cur()
      }
      : function() {
          return i.css(n, t, "")
      }
      , o = l(), e = r && r[3] || (i.cssNumber[t] ? "" : "px"), f = n.nodeType && (i.cssNumber[t] || "px" !== e && +o) && wt.exec(i.css(n, t));
      if (f && f[3] !== e) {
          for (o /= 2,
          e = e || f[3],
          f = +o || 1; c--; )
              i.style(n, t, f + e),
              (1 - h) * (1 - (h = l() / o || .5)) <= 0 && (c = 0),
              f /= h;
          f *= 2;
          i.style(n, t, f + e);
          r = r || []
      }
      return r && (f = +f || +o || 0,
      s = r[1] ? f + (r[1] + 1) * r[2] : +r[2],
      u && (u.unit = e,
      u.start = f,
      u.end = s)),
      s
  }
  function et(n, t) {
      for (var h, f, a, s, c, l, e, o = [], u = 0, v = n.length; u < v; u++)
          (f = n[u]).style && (h = f.style.display,
          t ? ("none" === h && (o[u] = r.get(f, "display") || null,
          o[u] || (f.style.display = "")),
          "" === f.style.display && kt(f) && (o[u] = (e = c = s = void 0,
          c = (a = f).ownerDocument,
          l = a.nodeName,
          (e = di[l]) || (s = c.body.appendChild(c.createElement(l)),
          e = i.css(s, "display"),
          s.parentNode.removeChild(s),
          "none" === e && (e = "block"),
          di[l] = e)))) : "none" !== h && (o[u] = "none",
          r.set(f, "display", h)));
      for (u = 0; u < v; u++)
          null != o[u] && (n[u].style.display = o[u]);
      return n
  }
  function s(n, t) {
      var r;
      return r = "undefined" != typeof n.getElementsByTagName ? n.getElementsByTagName(t || "*") : "undefined" != typeof n.querySelectorAll ? n.querySelectorAll(t || "*") : [],
      void 0 === t || t && c(n, t) ? i.merge([n], r) : r
  }
  function gi(n, t) {
      for (var i = 0, u = n.length; i < u; i++)
          r.set(n[i], "globalEval", !t || r.get(t[i], "globalEval"))
  }
  function vu(n, t, r, u, f) {
      for (var e, o, p, a, w, v, c = t.createDocumentFragment(), y = [], l = 0, b = n.length; l < b; l++)
          if ((e = n[l]) || 0 === e)
              if ("object" === it(e))
                  i.merge(y, e.nodeType ? [e] : e);
              else if (au.test(e)) {
                  for (o = o || c.appendChild(t.createElement("div")),
                  p = (cu.exec(e) || ["", ""])[1].toLowerCase(),
                  a = h[p] || h._default,
                  o.innerHTML = a[1] + i.htmlPrefilter(e) + a[2],
                  v = a[0]; v--; )
                      o = o.lastChild;
                  i.merge(y, o.childNodes);
                  (o = c.firstChild).textContent = ""
              } else
                  y.push(t.createTextNode(e));
      for (c.textContent = "",
      l = 0; e = y[l++]; )
          if (u && -1 < i.inArray(e, u))
              f && f.push(e);
          else if (w = ft(e),
          o = s(c.appendChild(e), "script"),
          w && gi(o),
          r)
              for (v = 0; e = o[v++]; )
                  lu.test(e.type || "") && r.push(e);
      return c
  }
  function ot() {
      return !0
  }
  function st() {
      return !1
  }
  function we(n, t) {
      return n === function() {
          try {
              return f.activeElement
          } catch (n) {}
      }() == ("focus" === t)
  }
  function nr(n, t, r, u, f, e) {
      var o, s;
      if ("object" == typeof t) {
          for (s in "string" != typeof r && (u = u || r,
          r = void 0),
          t)
              nr(n, s, r, u, t[s], e);
          return n
      }
      if (null == u && null == f ? (f = r,
      u = r = void 0) : null == f && ("string" == typeof r ? (f = u,
      u = void 0) : (f = u,
      u = r,
      r = void 0)),
      !1 === f)
          f = st;
      else if (!f)
          return n;
      return 1 === e && (o = f,
      (f = function(n) {
          return i().off(n),
          o.apply(this, arguments)
      }
      ).guid = o.guid || (o.guid = i.guid++)),
      n.each(function() {
          i.event.add(this, t, f, u, r)
      })
  }
  function hi(n, t, u) {
      u ? (r.set(n, t, !1),
      i.event.add(n, t, {
          namespace: !1,
          handler: function(n) {
              var o, e, f = r.get(this, t);
              if (1 & n.isTrigger && this[t]) {
                  if (f.length)
                      (i.event.special[t] || {}).delegateType && n.stopPropagation();
                  else if (f = b.call(arguments),
                  r.set(this, t, f),
                  o = u(this, t),
                  this[t](),
                  f !== (e = r.get(this, t)) || o ? r.set(this, t, !1) : e = {},
                  f !== e)
                      return n.stopImmediatePropagation(),
                      n.preventDefault(),
                      e.value
              } else
                  f.length && (r.set(this, t, {
                      value: i.event.trigger(i.extend(f[0], i.Event.prototype), f.slice(1), this)
                  }),
                  n.stopImmediatePropagation())
          }
      })) : void 0 === r.get(n, t) && i.event.add(n, t, ot)
  }
  function pu(n, t) {
      return c(n, "table") && c(11 !== t.nodeType ? t : t.firstChild, "tr") && i(n).children("tbody")[0] || n
  }
  function no(n) {
      return n.type = (null !== n.getAttribute("type")) + "/" + n.type,
      n
  }
  function to(n) {
      return "true/" === (n.type || "").slice(0, 5) ? n.type = n.type.slice(5) : n.removeAttribute("type"),
      n
  }
  function wu(n, t) {
      var u, c, f, s, h, l, a, e;
      if (1 === t.nodeType) {
          if (r.hasData(n) && (s = r.access(n),
          h = r.set(t, s),
          e = s.events))
              for (f in delete h.handle,
              h.events = {},
              e)
                  for (u = 0,
                  c = e[f].length; u < c; u++)
                      i.event.add(t, f, e[f][u]);
          o.hasData(n) && (l = o.access(n),
          a = i.extend({}, l),
          o.set(t, a))
      }
  }
  function ht(n, t, f, o) {
      t = yr.apply([], t);
      var a, w, l, v, h, b, c = 0, y = n.length, d = y - 1, p = t[0], k = u(p);
      if (k || 1 < y && "string" == typeof p && !e.checkClone && de.test(p))
          return n.each(function(i) {
              var r = n.eq(i);
              k && (t[0] = p.call(this, i, r.html()));
              ht(r, t, f, o)
          });
      if (y && (w = (a = vu(t, n[0].ownerDocument, !1, n, o)).firstChild,
      1 === a.childNodes.length && (a = w),
      w || o)) {
          for (v = (l = i.map(s(a, "script"), no)).length; c < y; c++)
              h = a,
              c !== d && (h = i.clone(h, !0, !0),
              v && i.merge(l, s(h, "script"))),
              f.call(n[c], h, c);
          if (v)
              for (b = l[l.length - 1].ownerDocument,
              i.map(l, to),
              c = 0; c < v; c++)
                  h = l[c],
                  lu.test(h.type || "") && !r.access(h, "globalEval") && i.contains(b, h) && (h.src && "module" !== (h.type || "").toLowerCase() ? i._evalUrl && !h.noModule && i._evalUrl(h.src, {
                      nonce: h.nonce || h.getAttribute("nonce")
                  }) : br(h.textContent.replace(ge, ""), h, b))
      }
      return n
  }
  function bu(n, t, r) {
      for (var u, e = t ? i.filter(t, n) : n, f = 0; null != (u = e[f]); f++)
          r || 1 !== u.nodeType || i.cleanData(s(u)),
          u.parentNode && (r && ft(u) && gi(s(u, "script")),
          u.parentNode.removeChild(u));
      return n
  }
  function ni(n, t, r) {
      var o, s, h, f, u = n.style;
      return (r = r || ci(n)) && ("" !== (f = r.getPropertyValue(t) || r[t]) || ft(n) || (f = i.style(n, t)),
      !e.pixelBoxStyles() && tr.test(f) && io.test(t) && (o = u.width,
      s = u.minWidth,
      h = u.maxWidth,
      u.minWidth = u.maxWidth = u.width = f,
      f = r.width,
      u.width = o,
      u.minWidth = s,
      u.maxWidth = h)),
      void 0 !== f ? f + "" : f
  }
  function ku(n, t) {
      return {
          get: function() {
              if (!n())
                  return (this.get = t).apply(this, arguments);
              delete this.get
          }
      }
  }
  function ir(n) {
      var t = i.cssProps[n] || nf[n];
      return t || (n in gu ? n : nf[n] = function(n) {
          for (var i = n[0].toUpperCase() + n.slice(1), t = du.length; t--; )
              if ((n = du[t] + i)in gu)
                  return n
      }(n) || n)
  }
  function uf(n, t, i) {
      var r = wt.exec(t);
      return r ? Math.max(0, r[2] - (i || 0)) + (r[3] || "px") : t
  }
  function rr(n, t, r, u, f, e) {
      var o = "width" === t ? 1 : 0
        , h = 0
        , s = 0;
      if (r === (u ? "border" : "content"))
          return 0;
      for (; o < 4; o += 2)
          "margin" === r && (s += i.css(n, r + w[o], !0, f)),
          u ? ("content" === r && (s -= i.css(n, "padding" + w[o], !0, f)),
          "margin" !== r && (s -= i.css(n, "border" + w[o] + "Width", !0, f))) : (s += i.css(n, "padding" + w[o], !0, f),
          "padding" !== r ? s += i.css(n, "border" + w[o] + "Width", !0, f) : h += i.css(n, "border" + w[o] + "Width", !0, f));
      return !u && 0 <= e && (s += Math.max(0, Math.ceil(n["offset" + t[0].toUpperCase() + t.slice(1)] - e - s - h - .5)) || 0),
      s
  }
  function ff(n, t, r) {
      var f = ci(n)
        , o = (!e.boxSizingReliable() || r) && "border-box" === i.css(n, "boxSizing", !1, f)
        , s = o
        , u = ni(n, t, f)
        , h = "offset" + t[0].toUpperCase() + t.slice(1);
      if (tr.test(u)) {
          if (!r)
              return u;
          u = "auto"
      }
      return (!e.boxSizingReliable() && o || "auto" === u || !parseFloat(u) && "inline" === i.css(n, "display", !1, f)) && n.getClientRects().length && (o = "border-box" === i.css(n, "boxSizing", !1, f),
      (s = h in n) && (u = n[h])),
      (u = parseFloat(u) || 0) + rr(n, t, r || (o ? "border" : "content"), s, f, u) + "px"
  }
  function a(n, t, i, r, u) {
      return new a.prototype.init(n,t,i,r,u)
  }
  function ur() {
      li && (!1 === f.hidden && n.requestAnimationFrame ? n.requestAnimationFrame(ur) : n.setTimeout(ur, i.fx.interval),
      i.fx.tick())
  }
  function hf() {
      return n.setTimeout(function() {
          ct = void 0
      }),
      ct = Date.now()
  }
  function ai(n, t) {
      var u, r = 0, i = {
          height: n
      };
      for (t = t ? 1 : 0; r < 4; r += 2 - t)
          i["margin" + (u = w[r])] = i["padding" + u] = n;
      return t && (i.opacity = i.width = n),
      i
  }
  function cf(n, t, i) {
      for (var u, f = (v.tweeners[t] || []).concat(v.tweeners["*"]), r = 0, e = f.length; r < e; r++)
          if (u = f[r].call(i, t, n))
              return u
  }
  function v(n, t, r) {
      var o, s, h = 0, a = v.prefilters.length, e = i.Deferred().always(function() {
          delete l.elem
      }), l = function() {
          if (s)
              return !1;
          for (var o = ct || hf(), t = Math.max(0, f.startTime + f.duration - o), i = 1 - (t / f.duration || 0), r = 0, u = f.tweens.length; r < u; r++)
              f.tweens[r].run(i);
          return e.notifyWith(n, [f, i, t]),
          i < 1 && u ? t : (u || e.notifyWith(n, [f, 1, 0]),
          e.resolveWith(n, [f]),
          !1)
      }, f = e.promise({
          elem: n,
          props: i.extend({}, t),
          opts: i.extend(!0, {
              specialEasing: {},
              easing: i.easing._default
          }, r),
          originalProperties: t,
          originalOptions: r,
          startTime: ct || hf(),
          duration: r.duration,
          tweens: [],
          createTween: function(t, r) {
              var u = i.Tween(n, f.opts, t, r, f.opts.specialEasing[t] || f.opts.easing);
              return f.tweens.push(u),
              u
          },
          stop: function(t) {
              var i = 0
                , r = t ? f.tweens.length : 0;
              if (s)
                  return this;
              for (s = !0; i < r; i++)
                  f.tweens[i].run(1);
              return t ? (e.notifyWith(n, [f, 1, 0]),
              e.resolveWith(n, [f, t])) : e.rejectWith(n, [f, t]),
              this
          }
      }), c = f.props;
      for (!function(n, t) {
          var r, f, e, u, o;
          for (r in n)
              if (e = t[f = y(r)],
              u = n[r],
              Array.isArray(u) && (e = u[1],
              u = n[r] = u[0]),
              r !== f && (n[f] = u,
              delete n[r]),
              (o = i.cssHooks[f]) && "expand"in o)
                  for (r in u = o.expand(u),
                  delete n[f],
                  u)
                      r in n || (n[r] = u[r],
                      t[r] = e);
              else
                  t[f] = e
      }(c, f.opts.specialEasing); h < a; h++)
          if (o = v.prefilters[h].call(f, n, c, f.opts))
              return u(o.stop) && (i._queueHooks(f.elem, f.opts.queue).stop = o.stop.bind(o)),
              o;
      return i.map(c, cf, f),
      u(f.opts.start) && f.opts.start.call(n, f),
      f.progress(f.opts.progress).done(f.opts.done, f.opts.complete).fail(f.opts.fail).always(f.opts.always),
      i.fx.timer(i.extend(l, {
          elem: n,
          anim: f,
          queue: f.opts.queue
      })),
      f
  }
  function g(n) {
      return (n.match(l) || []).join(" ")
  }
  function nt(n) {
      return n.getAttribute && n.getAttribute("class") || ""
  }
  function fr(n) {
      return Array.isArray(n) ? n : "string" == typeof n && n.match(l) || []
  }
  function hr(n, t, r, u) {
      var f;
      if (Array.isArray(t))
          i.each(t, function(t, i) {
              r || fo.test(n) ? u(n, i) : hr(n + "[" + ("object" == typeof i && null != i ? t : "") + "]", i, r, u)
          });
      else if (r || "object" !== it(t))
          u(n, t);
      else
          for (f in t)
              hr(n + "[" + f + "]", t[f], r, u)
  }
  function df(n) {
      return function(t, i) {
          "string" != typeof t && (i = t,
          t = "*");
          var r, f = 0, e = t.toLowerCase().match(l) || [];
          if (u(i))
              while (r = e[f++])
                  "+" === r[0] ? (r = r.slice(1) || "*",
                  (n[r] = n[r] || []).unshift(i)) : (n[r] = n[r] || []).push(i)
      }
  }
  function gf(n, t, r, u) {
      function e(s) {
          var h;
          return f[s] = !0,
          i.each(n[s] || [], function(n, i) {
              var s = i(t, r, u);
              return "string" != typeof s || o || f[s] ? o ? !(h = s) : void 0 : (t.dataTypes.unshift(s),
              e(s),
              !1)
          }),
          h
      }
      var f = {}
        , o = n === cr;
      return e(t.dataTypes[0]) || !f["*"] && e("*")
  }
  function ar(n, t) {
      var r, u, f = i.ajaxSettings.flatOptions || {};
      for (r in t)
          void 0 !== t[r] && ((f[r] ? n : u || (u = {}))[r] = t[r]);
      return u && i.extend(!0, n, u),
      n
  }
  var d = [], f = n.document, ue = Object.getPrototypeOf, b = d.slice, yr = d.concat, yi = d.push, ii = d.indexOf, ri = {}, pr = ri.toString, ui = ri.hasOwnProperty, wr = ui.toString, fe = wr.call(Object), e = {}, u = function(n) {
      return "function" == typeof n && "number" != typeof n.nodeType
  }, tt = function(n) {
      return null != n && n === n.window
  }, ee = {
      type: !0,
      src: !0,
      nonce: !0,
      noModule: !0
  }, kr = "3.4.1", i = function(n, t) {
      return new i.fn.init(n,t)
  }, oe = /^[\s\uFEFF\xA0]+|[\s\uFEFF\xA0]+$/g, k, wi, nu, tu, iu, ru, l, eu, ei, yt, kt, ki, di, gt, si, au, ct, li, lt, ef, of, sf, lf, at, af, vf, yf, er, or, ne, vt, te, vr, vi, ie, re;
  i.fn = i.prototype = {
      jquery: kr,
      constructor: i,
      length: 0,
      toArray: function() {
          return b.call(this)
      },
      get: function(n) {
          return null == n ? b.call(this) : n < 0 ? this[n + this.length] : this[n]
      },
      pushStack: function(n) {
          var t = i.merge(this.constructor(), n);
          return t.prevObject = this,
          t
      },
      each: function(n) {
          return i.each(this, n)
      },
      map: function(n) {
          return this.pushStack(i.map(this, function(t, i) {
              return n.call(t, i, t)
          }))
      },
      slice: function() {
          return this.pushStack(b.apply(this, arguments))
      },
      first: function() {
          return this.eq(0)
      },
      last: function() {
          return this.eq(-1)
      },
      eq: function(n) {
          var i = this.length
            , t = +n + (n < 0 ? i : 0);
          return this.pushStack(0 <= t && t < i ? [this[t]] : [])
      },
      end: function() {
          return this.prevObject || this.constructor()
      },
      push: yi,
      sort: d.sort,
      splice: d.splice
  };
  i.extend = i.fn.extend = function() {
      var s, f, e, t, o, c, n = arguments[0] || {}, r = 1, l = arguments.length, h = !1;
      for ("boolean" == typeof n && (h = n,
      n = arguments[r] || {},
      r++),
      "object" == typeof n || u(n) || (n = {}),
      r === l && (n = this,
      r--); r < l; r++)
          if (null != (s = arguments[r]))
              for (f in s)
                  t = s[f],
                  "__proto__" !== f && n !== t && (h && t && (i.isPlainObject(t) || (o = Array.isArray(t))) ? (e = n[f],
                  c = o && !Array.isArray(e) ? [] : o || i.isPlainObject(e) ? e : {},
                  o = !1,
                  n[f] = i.extend(h, c, t)) : void 0 !== t && (n[f] = t));
      return n
  }
  ;
  i.extend({
      expando: "jQuery" + (kr + Math.random()).replace(/\D/g, ""),
      isReady: !0,
      error: function(n) {
          throw new Error(n);
      },
      noop: function() {},
      isPlainObject: function(n) {
          var t, i;
          return !(!n || "[object Object]" !== pr.call(n)) && (!(t = ue(n)) || "function" == typeof (i = ui.call(t, "constructor") && t.constructor) && wr.call(i) === fe)
      },
      isEmptyObject: function(n) {
          for (var t in n)
              return !1;
          return !0
      },
      globalEval: function(n, t) {
          br(n, {
              nonce: t && t.nonce
          })
      },
      each: function(n, t) {
          var r, i = 0;
          if (pi(n)) {
              for (r = n.length; i < r; i++)
                  if (!1 === t.call(n[i], i, n[i]))
                      break
          } else
              for (i in n)
                  if (!1 === t.call(n[i], i, n[i]))
                      break;
          return n
      },
      trim: function(n) {
          return null == n ? "" : (n + "").replace(oe, "")
      },
      makeArray: function(n, t) {
          var r = t || [];
          return null != n && (pi(Object(n)) ? i.merge(r, "string" == typeof n ? [n] : n) : yi.call(r, n)),
          r
      },
      inArray: function(n, t, i) {
          return null == t ? -1 : ii.call(t, n, i)
      },
      merge: function(n, t) {
          for (var u = +t.length, i = 0, r = n.length; i < u; i++)
              n[r++] = t[i];
          return n.length = r,
          n
      },
      grep: function(n, t, i) {
          for (var u = [], r = 0, f = n.length, e = !i; r < f; r++)
              !t(n[r], r) !== e && u.push(n[r]);
          return u
      },
      map: function(n, t, i) {
          var e, u, r = 0, f = [];
          if (pi(n))
              for (e = n.length; r < e; r++)
                  null != (u = t(n[r], r, i)) && f.push(u);
          else
              for (r in n)
                  null != (u = t(n[r], r, i)) && f.push(u);
          return yr.apply([], f)
      },
      guid: 1,
      support: e
  });
  "function" == typeof Symbol && (i.fn[Symbol.iterator] = d[Symbol.iterator]);
  i.each("Boolean Number String Function Array Date RegExp Object Error Symbol".split(" "), function(n, t) {
      ri["[object " + t + "]"] = t.toLowerCase()
  });
  k = function(n) {
      function u(n, t, r, u) {
          var s, p, l, v, w, d, g, y = t && t.ownerDocument, a = t ? t.nodeType : 9;
          if (r = r || [],
          "string" != typeof n || !n || 1 !== a && 9 !== a && 11 !== a)
              return r;
          if (!u && ((t ? t.ownerDocument || t : c) !== i && b(t),
          t = t || i,
          h)) {
              if (11 !== a && (w = ar.exec(n)))
                  if (s = w[1]) {
                      if (9 === a) {
                          if (!(l = t.getElementById(s)))
                              return r;
                          if (l.id === s)
                              return r.push(l),
                              r
                      } else if (y && (l = y.getElementById(s)) && et(t, l) && l.id === s)
                          return r.push(l),
                          r
                  } else {
                      if (w[2])
                          return k.apply(r, t.getElementsByTagName(n)),
                          r;
                      if ((s = w[3]) && e.getElementsByClassName && t.getElementsByClassName)
                          return k.apply(r, t.getElementsByClassName(s)),
                          r
                  }
              if (e.qsa && !lt[n + " "] && (!o || !o.test(n)) && (1 !== a || "object" !== t.nodeName.toLowerCase())) {
                  if (g = n,
                  y = t,
                  1 === a && er.test(n)) {
                      for ((v = t.getAttribute("id")) ? v = v.replace(yi, pi) : t.setAttribute("id", v = f),
                      p = (d = ft(n)).length; p--; )
                          d[p] = "#" + v + " " + pt(d[p]);
                      g = d.join(",");
                      y = ti.test(n) && ri(t.parentNode) || t
                  }
                  try {
                      return k.apply(r, y.querySelectorAll(g)),
                      r
                  } catch (t) {
                      lt(n, !0)
                  } finally {
                      v === f && t.removeAttribute("id")
                  }
              }
          }
          return si(n.replace(at, "$1"), t, r, u)
      }
      function yt() {
          var n = [];
          return function i(r, u) {
              return n.push(r + " ") > t.cacheLength && delete i[n.shift()],
              i[r + " "] = u
          }
      }
      function l(n) {
          return n[f] = !0,
          n
      }
      function a(n) {
          var t = i.createElement("fieldset");
          try {
              return !!n(t)
          } catch (n) {
              return !1
          } finally {
              t.parentNode && t.parentNode.removeChild(t);
              t = null
          }
      }
      function ii(n, i) {
          for (var r = n.split("|"), u = r.length; u--; )
              t.attrHandle[r[u]] = i
      }
      function bi(n, t) {
          var i = t && n
            , r = i && 1 === n.nodeType && 1 === t.nodeType && n.sourceIndex - t.sourceIndex;
          if (r)
              return r;
          if (i)
              while (i = i.nextSibling)
                  if (i === t)
                      return -1;
          return n ? 1 : -1
      }
      function yr(n) {
          return function(t) {
              return "input" === t.nodeName.toLowerCase() && t.type === n
          }
      }
      function pr(n) {
          return function(t) {
              var i = t.nodeName.toLowerCase();
              return ("input" === i || "button" === i) && t.type === n
          }
      }
      function ki(n) {
          return function(t) {
              return "form"in t ? t.parentNode && !1 === t.disabled ? "label"in t ? "label"in t.parentNode ? t.parentNode.disabled === n : t.disabled === n : t.isDisabled === n || t.isDisabled !== !n && vr(t) === n : t.disabled === n : "label"in t && t.disabled === n
          }
      }
      function it(n) {
          return l(function(t) {
              return t = +t,
              l(function(i, r) {
                  for (var u, f = n([], i.length, t), e = f.length; e--; )
                      i[u = f[e]] && (i[u] = !(r[u] = i[u]))
              })
          })
      }
      function ri(n) {
          return n && "undefined" != typeof n.getElementsByTagName && n
      }
      function di() {}
      function pt(n) {
          for (var t = 0, r = n.length, i = ""; t < r; t++)
              i += n[t].value;
          return i
      }
      function wt(n, t, i) {
          var r = t.dir
            , u = t.next
            , e = u || r
            , o = i && "parentNode" === e
            , s = gi++;
          return t.first ? function(t, i, u) {
              while (t = t[r])
                  if (1 === t.nodeType || o)
                      return n(t, i, u);
              return !1
          }
          : function(t, i, h) {
              var c, l, a, y = [v, s];
              if (h) {
                  while (t = t[r])
                      if ((1 === t.nodeType || o) && n(t, i, h))
                          return !0
              } else
                  while (t = t[r])
                      if (1 === t.nodeType || o)
                          if (l = (a = t[f] || (t[f] = {}))[t.uniqueID] || (a[t.uniqueID] = {}),
                          u && u === t.nodeName.toLowerCase())
                              t = t[r] || t;
                          else {
                              if ((c = l[e]) && c[0] === v && c[1] === s)
                                  return y[2] = c[2];
                              if ((l[e] = y)[2] = n(t, i, h))
                                  return !0
                          }
              return !1
          }
      }
      function ui(n) {
          return 1 < n.length ? function(t, i, r) {
              for (var u = n.length; u--; )
                  if (!n[u](t, i, r))
                      return !1;
              return !0
          }
          : n[0]
      }
      function bt(n, t, i, r, u) {
          for (var e, o = [], f = 0, s = n.length, h = null != t; f < s; f++)
              (e = n[f]) && (i && !i(e, r, u) || (o.push(e),
              h && t.push(f)));
          return o
      }
      function fi(n, t, i, r, e, o) {
          return r && !r[f] && (r = fi(r)),
          e && !e[f] && (e = fi(e, o)),
          l(function(f, o, s, h) {
              var a, l, v, w = [], p = [], b = o.length, d = f || function(n, t, i) {
                  for (var r = 0, f = t.length; r < f; r++)
                      u(n, t[r], i);
                  return i
              }(t || "*", s.nodeType ? [s] : s, []), y = !n || !f && t ? d : bt(d, w, n, s, h), c = i ? e || (f ? n : b || r) ? [] : o : y;
              if (i && i(y, c, s, h),
              r)
                  for (a = bt(c, p),
                  r(a, [], s, h),
                  l = a.length; l--; )
                      (v = a[l]) && (c[p[l]] = !(y[p[l]] = v));
              if (f) {
                  if (e || n) {
                      if (e) {
                          for (a = [],
                          l = c.length; l--; )
                              (v = c[l]) && a.push(y[l] = v);
                          e(null, c = [], a, h)
                      }
                      for (l = c.length; l--; )
                          (v = c[l]) && -1 < (a = e ? nt(f, v) : w[l]) && (f[a] = !(o[a] = v))
                  }
              } else
                  c = bt(c === o ? c.splice(b, c.length) : c),
                  e ? e(null, o, c, h) : k.apply(o, c)
          })
      }
      function ei(n) {
          for (var o, u, r, s = n.length, h = t.relative[n[0].type], c = h || t.relative[" "], i = h ? 1 : 0, l = wt(function(n) {
              return n === o
          }, c, !0), a = wt(function(n) {
              return -1 < nt(o, n)
          }, c, !0), e = [function(n, t, i) {
              var r = !h && (i || t !== ht) || ((o = t).nodeType ? l(n, t, i) : a(n, t, i));
              return o = null,
              r
          }
          ]; i < s; i++)
              if (u = t.relative[n[i].type])
                  e = [wt(ui(e), u)];
              else {
                  if ((u = t.filter[n[i].type].apply(null, n[i].matches))[f]) {
                      for (r = ++i; r < s; r++)
                          if (t.relative[n[r].type])
                              break;
                      return fi(1 < i && ui(e), 1 < i && pt(n.slice(0, i - 1).concat({
                          value: " " === n[i - 2].type ? "*" : ""
                      })).replace(at, "$1"), u, i < r && ei(n.slice(i, r)), r < s && ei(n = n.slice(r)), r < s && pt(n))
                  }
                  e.push(u)
              }
          return ui(e)
      }
      var rt, e, t, st, oi, ft, kt, si, ht, w, ut, b, i, s, h, o, d, ct, et, f = "sizzle" + 1 * new Date, c = n.document, v = 0, gi = 0, hi = yt(), ci = yt(), li = yt(), lt = yt(), dt = function(n, t) {
          return n === t && (ut = !0),
          0
      }, nr = {}.hasOwnProperty, g = [], tr = g.pop, ir = g.push, k = g.push, ai = g.slice, nt = function(n, t) {
          for (var i = 0, r = n.length; i < r; i++)
              if (n[i] === t)
                  return i;
          return -1
      }, gt = "checked|selected|async|autofocus|autoplay|controls|defer|disabled|hidden|ismap|loop|multiple|open|readonly|required|scoped", r = "[\\x20\\t\\r\\n\\f]", tt = "(?:\\\\.|[\\w-]|[^\0-\\xa0])+", vi = "\\[" + r + "*(" + tt + ")(?:" + r + "*([*^$|!~]?=)" + r + "*(?:'((?:\\\\.|[^\\\\'])*)'|\"((?:\\\\.|[^\\\\\"])*)\"|(" + tt + "))|)" + r + "*\\]", ni = ":(" + tt + ")(?:\\((('((?:\\\\.|[^\\\\'])*)'|\"((?:\\\\.|[^\\\\\"])*)\")|((?:\\\\.|[^\\\\()[\\]]|" + vi + ")*)|.*)\\)|)", rr = new RegExp(r + "+","g"), at = new RegExp("^" + r + "+|((?:^|[^\\\\])(?:\\\\.)*)" + r + "+$","g"), ur = new RegExp("^" + r + "*," + r + "*"), fr = new RegExp("^" + r + "*([>+~]|" + r + ")" + r + "*"), er = new RegExp(r + "|>"), or = new RegExp(ni), sr = new RegExp("^" + tt + "$"), vt = {
          ID: new RegExp("^#(" + tt + ")"),
          CLASS: new RegExp("^\\.(" + tt + ")"),
          TAG: new RegExp("^(" + tt + "|[*])"),
          ATTR: new RegExp("^" + vi),
          PSEUDO: new RegExp("^" + ni),
          CHILD: new RegExp("^:(only|first|last|nth|nth-last)-(child|of-type)(?:\\(" + r + "*(even|odd|(([+-]|)(\\d*)n|)" + r + "*(?:([+-]|)" + r + "*(\\d+)|))" + r + "*\\)|)","i"),
          bool: new RegExp("^(?:" + gt + ")$","i"),
          needsContext: new RegExp("^" + r + "*[>+~]|:(even|odd|eq|gt|lt|nth|first|last)(?:\\(" + r + "*((?:-\\d)?\\d*)" + r + "*\\)|)(?=[^-]|$)","i")
      }, hr = /HTML$/i, cr = /^(?:input|select|textarea|button)$/i, lr = /^h\d$/i, ot = /^[^{]+\{\s*\[native \w/, ar = /^(?:#([\w-]+)|(\w+)|\.([\w-]+))$/, ti = /[+~]/, y = new RegExp("\\\\([\\da-f]{1,6}" + r + "?|(" + r + ")|.)","ig"), p = function(n, t, i) {
          var r = "0x" + t - 65536;
          return r != r || i ? t : r < 0 ? String.fromCharCode(r + 65536) : String.fromCharCode(r >> 10 | 55296, 1023 & r | 56320)
      }, yi = /([\0-\x1f\x7f]|^-?\d)|^-$|[^\0-\x1f\x7f-\uFFFF\w-]/g, pi = function(n, t) {
          return t ? "\0" === n ? "�" : n.slice(0, -1) + "\\" + n.charCodeAt(n.length - 1).toString(16) + " " : "\\" + n
      }, wi = function() {
          b()
      }, vr = wt(function(n) {
          return !0 === n.disabled && "fieldset" === n.nodeName.toLowerCase()
      }, {
          dir: "parentNode",
          next: "legend"
      });
      try {
          k.apply(g = ai.call(c.childNodes), c.childNodes);
          g[c.childNodes.length].nodeType
      } catch (rt) {
          k = {
              apply: g.length ? function(n, t) {
                  ir.apply(n, ai.call(t))
              }
              : function(n, t) {
                  for (var i = n.length, r = 0; n[i++] = t[r++]; )
                      ;
                  n.length = i - 1
              }
          }
      }
      for (rt in e = u.support = {},
      oi = u.isXML = function(n) {
          var i = n.namespaceURI
            , t = (n.ownerDocument || n).documentElement;
          return !hr.test(i || t && t.nodeName || "HTML")
      }
      ,
      b = u.setDocument = function(n) {
          var v, u, l = n ? n.ownerDocument || n : c;
          return l !== i && 9 === l.nodeType && l.documentElement && (s = (i = l).documentElement,
          h = !oi(i),
          c !== i && (u = i.defaultView) && u.top !== u && (u.addEventListener ? u.addEventListener("unload", wi, !1) : u.attachEvent && u.attachEvent("onunload", wi)),
          e.attributes = a(function(n) {
              return n.className = "i",
              !n.getAttribute("className")
          }),
          e.getElementsByTagName = a(function(n) {
              return n.appendChild(i.createComment("")),
              !n.getElementsByTagName("*").length
          }),
          e.getElementsByClassName = ot.test(i.getElementsByClassName),
          e.getById = a(function(n) {
              return s.appendChild(n).id = f,
              !i.getElementsByName || !i.getElementsByName(f).length
          }),
          e.getById ? (t.filter.ID = function(n) {
              var t = n.replace(y, p);
              return function(n) {
                  return n.getAttribute("id") === t
              }
          }
          ,
          t.find.ID = function(n, t) {
              if ("undefined" != typeof t.getElementById && h) {
                  var i = t.getElementById(n);
                  return i ? [i] : []
              }
          }
          ) : (t.filter.ID = function(n) {
              var t = n.replace(y, p);
              return function(n) {
                  var i = "undefined" != typeof n.getAttributeNode && n.getAttributeNode("id");
                  return i && i.value === t
              }
          }
          ,
          t.find.ID = function(n, t) {
              if ("undefined" != typeof t.getElementById && h) {
                  var r, u, f, i = t.getElementById(n);
                  if (i) {
                      if ((r = i.getAttributeNode("id")) && r.value === n)
                          return [i];
                      for (f = t.getElementsByName(n),
                      u = 0; i = f[u++]; )
                          if ((r = i.getAttributeNode("id")) && r.value === n)
                              return [i]
                  }
                  return []
              }
          }
          ),
          t.find.TAG = e.getElementsByTagName ? function(n, t) {
              return "undefined" != typeof t.getElementsByTagName ? t.getElementsByTagName(n) : e.qsa ? t.querySelectorAll(n) : void 0
          }
          : function(n, t) {
              var i, r = [], f = 0, u = t.getElementsByTagName(n);
              if ("*" === n) {
                  while (i = u[f++])
                      1 === i.nodeType && r.push(i);
                  return r
              }
              return u
          }
          ,
          t.find.CLASS = e.getElementsByClassName && function(n, t) {
              if ("undefined" != typeof t.getElementsByClassName && h)
                  return t.getElementsByClassName(n)
          }
          ,
          d = [],
          o = [],
          (e.qsa = ot.test(i.querySelectorAll)) && (a(function(n) {
              s.appendChild(n).innerHTML = "<a id='" + f + "'><\/a><select id='" + f + "-\r\\' msallowcapture=''><option selected=''><\/option><\/select>";
              n.querySelectorAll("[msallowcapture^='']").length && o.push("[*^$]=" + r + "*(?:''|\"\")");
              n.querySelectorAll("[selected]").length || o.push("\\[" + r + "*(?:value|" + gt + ")");
              n.querySelectorAll("[id~=" + f + "-]").length || o.push("~=");
              n.querySelectorAll(":checked").length || o.push(":checked");
              n.querySelectorAll("a#" + f + "+*").length || o.push(".#.+[+~]")
          }),
          a(function(n) {
              n.innerHTML = "<a href='' disabled='disabled'><\/a><select disabled='disabled'><option/><\/select>";
              var t = i.createElement("input");
              t.setAttribute("type", "hidden");
              n.appendChild(t).setAttribute("name", "D");
              n.querySelectorAll("[name=d]").length && o.push("name" + r + "*[*^$|!~]?=");
              2 !== n.querySelectorAll(":enabled").length && o.push(":enabled", ":disabled");
              s.appendChild(n).disabled = !0;
              2 !== n.querySelectorAll(":disabled").length && o.push(":enabled", ":disabled");
              n.querySelectorAll("*,:x");
              o.push(",.*:")
          })),
          (e.matchesSelector = ot.test(ct = s.matches || s.webkitMatchesSelector || s.mozMatchesSelector || s.oMatchesSelector || s.msMatchesSelector)) && a(function(n) {
              e.disconnectedMatch = ct.call(n, "*");
              ct.call(n, "[s!='']:x");
              d.push("!=", ni)
          }),
          o = o.length && new RegExp(o.join("|")),
          d = d.length && new RegExp(d.join("|")),
          v = ot.test(s.compareDocumentPosition),
          et = v || ot.test(s.contains) ? function(n, t) {
              var r = 9 === n.nodeType ? n.documentElement : n
                , i = t && t.parentNode;
              return n === i || !(!i || 1 !== i.nodeType || !(r.contains ? r.contains(i) : n.compareDocumentPosition && 16 & n.compareDocumentPosition(i)))
          }
          : function(n, t) {
              if (t)
                  while (t = t.parentNode)
                      if (t === n)
                          return !0;
              return !1
          }
          ,
          dt = v ? function(n, t) {
              if (n === t)
                  return ut = !0,
                  0;
              var r = !n.compareDocumentPosition - !t.compareDocumentPosition;
              return r || (1 & (r = (n.ownerDocument || n) === (t.ownerDocument || t) ? n.compareDocumentPosition(t) : 1) || !e.sortDetached && 