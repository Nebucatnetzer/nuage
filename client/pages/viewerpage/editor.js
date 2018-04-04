import React from 'react';
import PropTypes from 'prop-types';

import { NgIf, Loader } from '../../components/';

import CodeMirror from 'codemirror/lib/codemirror';
import 'codemirror/lib/codemirror.css';
window.CodeMirror = CodeMirror;
// keybinding
import 'codemirror/keymap/emacs.js';
// search
import 'codemirror/addon/search/searchcursor.js';
import 'codemirror/addon/search/search.js';
import 'codemirror/addon/edit/matchbrackets.js';
import 'codemirror/addon/comment/comment.js';
import 'codemirror/addon/dialog/dialog.js';
// code folding
import 'codemirror/addon/fold/foldcode';
import 'codemirror/addon/fold/foldgutter';
import 'codemirror/addon/fold/foldgutter.css';

import './editor.scss';

export class Editor extends React.Component {
    constructor(props){
        super(props);
        this.state = {
            loading: null,
            editor: null,
            filename: this.props.filename
        };
    }

    componentWillReceiveProps(props){
        if(this.props.content !== props.content){
            this.state.editor.getDoc().setValue(props.content);
        }
    }

    componentDidMount(){
        this.setState({loading: null, error: false}, () => {
            window.setTimeout(() => {
                if(this.state.loading === null) this.setState({loading: true});
            }, 200);
        });
        this.loadMode(this.props.filename)
            .then((res) => new Promise((done) => this.setState({loading: false}, () => done(res))))
            .then(loadCodeMirror.bind(this));

        function loadCodeMirror(CodeMirror){
            const size_small = 500;
            let editor = CodeMirror(document.getElementById('editor'), {
                value: this.props.content,
                lineNumbers: document.body.offsetWidth > size_small ? true : false,
                mode: CodeMirror.__mode,
                keyMap: "emacs",
                lineWrapping: true,
                foldGutter: {
                    minFoldSize: 1
                }
            });
            window.mirror = editor;

            if(CodeMirror.afterInit){
                CodeMirror.afterInit(editor);
            }

            this.setState({editor: editor});

            editor.on('change', (edit) => {
                if(this.props.onChange){
                    this.props.onChange(edit.getValue());
                }
            });

            CodeMirror.commands.save = () => {
                let elt = editor.getWrapperElement();
                elt.style.background = "rgba(0,0,0,0.1)";
                elt.style.transition = "";
                window.setTimeout(function() {
                    elt.style.transition = "background 0.5s ease-out";
                    elt.style.background = "";
                }, 200);
                this.props.onSave && this.props.onSave();
            };
        }
    }

    componentWillUnmount(){
        this.state.editor.clearHistory();
    }

    loadMode(file){
        let ext = file.split('.').pop(),
            mode = null;

        ext = ext.replace(/~$/, ''); // remove emacs mark when a file is opened

        if(ext === 'org' || ext === 'org_archive'){ mode = 'orgmode'; }
        else if(ext === 'sh'){ mode = 'shell'; }
        else if(ext === 'py'){ mode = 'python'; }
        else if(ext === 'html' || ext === 'htm'){ mode = 'html'; }
        else if(ext === 'css'){ mode = 'css'; }
        else if(ext === 'less' || ext === 'scss' || ext === 'sass'){ mode = 'sass'; }
        else if(ext === 'js' || ext === 'json'){ mode = 'javascript'; }
        else if(ext === 'jsx'){ mode = 'jsx'; }
        else if(ext === 'php' || ext === 'php5' || ext === 'php4'){ mode = 'php'; }
        else if(ext === 'elm'){ mode = 'elm'; }
        else if(ext === 'erl'){ mode = 'erlang'; }
        else if(ext === 'go'){mode = 'go'; }
        else if(ext === 'markdown' || ext === 'md'){mode = 'markdown'; }
        else if(ext === 'pl' || ext === 'pm'){mode = 'perl'; }
        else if(ext === 'clj'){ mode = 'clojure'; }
        else if(ext === 'el' || ext === 'lisp' || ext === 'cl' || ext === 'emacs'){ mode = 'lisp'; }
        else if(ext === 'Dockerfile'){ mode = 'dockerfile'; }
        else if(ext === 'R'){ mode = 'r'; }
        else if(ext === 'Makefile'){ mode = 'cmake'; }
        else if(ext === 'rb'){ mode = 'ruby'; }
        else if(ext === 'sql'){ mode = 'sql'; }
        else if(ext === 'xml' || ext === 'rss' || ext === 'svg' || ext === 'atom'){ mode = 'xml'; }
        else if(ext === 'yml'){ mode = 'yml'; }
        else if(ext === 'lua'){ mode = 'lua'; }
        else if(ext === 'csv'){ mode = 'csv'; }
        else if(ext === 'rs' || ext === 'rlib'){ mode = 'rust'; }
        else if(ext === 'latex' || ext === 'tex'){ mode = 'stex'; }
        else if(ext === 'c' || ext === 'cpp' || ext === 'java' || ext === 'h'){
            mode = 'clike';
        }else{
            mode = 'text';
        }

        return import(/* webpackChunkName: "editor" */'./editor/'+mode)
            .catch(() => import("./editor/text"))
            .then((module) => Promise.resolve(module.default));
    }

    render() {
        return (
            <div style={{height: '100%'}}>
              <NgIf cond={this.state.loading === true} style={{height: '100%'}}>
                <Loader/>
              </NgIf>
              <NgIf cond={this.state.loading === false} style={{height: '100%'}}>
                <div id="editor" style={{height: '100%'}}></div>
              </NgIf>
            </div>
        );
    }
}

Editor.propTypes = {
    content: PropTypes.string.isRequired,
    filename: PropTypes.string.isRequired,
    onChange: PropTypes.func,
    onSave: PropTypes.func
};
