// ==UserScript==
// @name         TreeBar
// @name:zh-CN   目录树导航
// @namespace    https://github.com/zhilidali/TreeBar/
// @version      0.1.9
// @description  目录树导航 - 显示文章目录大纲导航
// @description:zh-cn    目录树导航 - 显示文章目录大纲导航
// @author       zhilidali
// @mail         zhilidali@qq.com
// @license      MIT Licensed
// @match        http*://www.jianshu.com/p/*
// @match        http*://cdn2.jianshu.io/p/*
// @match        http*://juejin.im/post/*
// @match        http*://juejin.im/entry/*
// @match        http*://sspai.com/*
// @match        http*://zhuanlan.zhihu.com/p/*
// @match        http*://mp.weixin.qq.com/s?*
// @match        http*://cnodejs.org/topic/*
// @match        http*://div.io/topic/*
// @match        http*://www.zcfy.cc/article/*
// @grant        none
// ==/UserScript==

(function() {
    'use strict';

    var map = {
        jianshu: {
            tagName: '.show-content',
            style: {
                top: '55px',
                color: '#ea6f5a',
            }
        },
        zhihu: {
            tagName: '.Post-RichText',
        },
        sspai: {
            tagName: '#article-content',
        },
        juejin: {
            tagName: '.article-content',
        },
        div: {
            tagName: '.topic-firstfloor-detail'
        },
        zcfy: {
            tagName: '.markdown-body',
        },
        qq: {
            tagName: '.rich_media_content',
        },
        default: {
            tagName: 'body'
        }
    };
    var treeBar = window.treeBar = {
        site: {
            name: '',
            tagName: '',
        },
        className: 'treeBar treeBar-slide',
        style: `
            /* 样式重置 */
                html { scroll-behavior: smooth; }
                .treeBar ul { padding-left: 1.1em; margin: 0; }
                .treeBar > ul > li { list-style-type: disc; }
                .treeBar > ul > li > ul > li { list-style-type: circle; }
                .treeBar > ul > li > ul > li > ul > li { list-style-type: square; }
            /* common */
                .treeBar {
                    z-index: 99999; position: fixed; top: 10%; right: 0; max-width: 300px; max-height: 60%;
                    border: 1px solid #ddd; overflow-y: auto; overflow-x: visible; background-color: rgba(255, 255, 255, .9);
                    border-radius: 16px;
                }
                .treeBar-resize {
                    position: absolute; /*cursor: col-resize;*/ width: 5px; left: -2px; top: 0; bottom: 0;
                }
                .treeBar-btn {
                    box-sizing: border-box; position: sticky; top: -1px; left: -1px; width: 72px; height: 28px;
                    padding: 0; border: 1px solid #ddd; border-radius: 3px; box-shadow: 0 1px 1px 1px #ddd;
                    font-size: 14px; background-color: #fff; vertical-align: middle; text-align: center;
                    outline: none; cursor: pointer;color: #fff;background-color: #293846;
                }
                .treeBar > ul {
                    padding: 0px 10px 10px 25px;background-color: #f0f0f0l;
                }
                .treeBar > ul > li a {
                    line-height: 30px; /*overflow: hidden; white-space: nowrap; text-overflow: ellipsis;*/
                    text-decoration: none; font-size: 14px; cursor: pointer; color: #121c27;
                }
                .treeBar > ul > li a:hover {
                    text-decoration: underline;
                }
            /* slideToggle */
                .treeBar-slide { overflow-y: visible; }
                .treeBar-slide .treeBar-btn { left: -71px; top: -1px; }
                .treeBar-slide > ul { display: none; }`,
        innerDom: `<button class="treeBar-btn">目录</button><div class="treeBar-resize"></div>`,
        matchSite: function() { /* 匹配站点 */
            var domain = location.href.match(/([\d\w]+)\.(com|cn|net|org|im|io|cc)/i);
            this.site.name = (domain && domain[1]);
            var siteInfo = map[this.site.name] || map.default;
            this.site.tagName = siteInfo.tagName;
            this.site.sync = siteInfo.sync || false;
            if (siteInfo.style) {
                this.style += `
                    .treeBar {
                        top: ${siteInfo.style.top};
                        border-color: ${siteInfo.style.color};
                    }
                    .treeBar-btn {
                        border-color: ${siteInfo.style.color};
                        background-color: ${siteInfo.style.color};
                        color: #fff;
                    }
                    .treeBar > ul > li a {
                        color: ${siteInfo.style.color};
                    }
                `;
            }
        },
        createDom: function() { /* 创建DOM */
            var style = document.createElement('style'),
                dom = document.createElement('div');
            style.innerHTML = this.style;
            document.head.appendChild(style);
            dom.className = this.className;
            dom.innerHTML = this.innerDom + this.ul;
            document.body.appendChild(dom);
        },
        onEvent: function() {
            var eTree = document.querySelector('.treeBar'),
                eBtn = document.querySelector('.treeBar-btn'),
                eResize = document.querySelector('.treeBar-resize');
            eBtn.onclick = function() {
                eTree.classList.toggle('treeBar-slide');
            };
            /*var resize = {};
            document.body.onmouseup = function() {
                console.log('up');
                resize.flag = false;
            };
            eResize.onmousedown = function() {
                resize.flag = true;
            };
            document.body.onmousemove = function() {
                if (!resize.flag) return;
                if (resize.current === undefined) {
                    resize.current = event.x;
                    return;
                }
                var x = event.x - resize.current;
                if(Math.abs(x) >= 10) {
                    tree.style.width = tree.offsetWidth - x + 'px';
                    console.log(x);
                    resize.current = event.x;
                }
            };*/
        },
        init: function() {
            console.time('TreeBar');

            // 1. 获取DOM
            var hList = document.querySelector(treeBar.site.tagName)
                .querySelectorAll('h2, h3');
            // 2. 构建数据
            var tree = transformTree(Array.from(hList));
            // 3. 构建DOM
            treeBar.ul = compileList(tree);
            treeBar.createDom();
            // 4. 注册事件
            treeBar.onEvent();
            console.timeEnd('TreeBar');
            // 5. 动态获取窗口大小，选择展开还是收缩
            var body = (document.compatMode && document.compatMode == 'CSS1Compat') ? document.documentElement : document.body;
            var bodyWidth = body.offsetWidth;
            if (bodyWidth > 500) {
                var elements = document.getElementsByClassName("treeBar");
                if (elements[0].className!== "treeBar") {
                    elements[0].className = "treeBar";
                }

            }

        }
    };

    // 0. 匹配站点
    treeBar.matchSite();
    if (treeBar.site.tagName !== 'body' && document.querySelector(treeBar.site.tagName)) {
        treeBar.init();
    } else {
        document.onreadystatechange = function() {
            document.readyState === "complete" && treeBar.init();
        };
    }


    /* 解析DOM，构建树形数据 */
    function transformTree(list) {
        var result = [];
        list.reduce(function(res, cur, index, arr) {
            var prev = res[res.length - 1];
            if (compare(prev, cur)) {
                if (!prev.sub) prev.sub = [];
                prev.sub.push(cur);
                if (index === arr.length - 1) prev.sub = transformTree(prev.sub);
            } else {
                construct(res, cur);
                if (prev && prev.sub) prev.sub = transformTree(prev.sub);
            }
            return res;
        }, result);

        // 转为树形结构的条件依据
        function compare(prev, cur) {
            return prev && cur.tagName.replace(/h/i, '') > prev.tagName.replace(/h/i, '');
        }

        // 转为树形结构后的数据改造
        function construct(arr, obj) {
            arr.push({
                name: obj.innerText,
                id: obj.id = obj.innerText,
                tagName: obj.tagName
            });
        }

        return result;
    }

    /* 根据数据构建目录 */
    function compileList(tree) {
        var list = '';
        tree.forEach(function(item) {
            var ul = item.sub ? compileList(item.sub) : '';
            list +=
                `<li>
                    <a href="#${item.id}" title="${item.name}">${item.name}</a>${ul}
                </li>`;
        });
        return `<ul>${list}</ul>`;
    }

})();