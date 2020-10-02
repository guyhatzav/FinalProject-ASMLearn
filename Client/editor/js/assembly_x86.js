ace.define("ace/snippets/assembly_x86", ["require", "exports", "module"], (require, exports, module) => { "use strict";
	exports.snippetText = `# PROC
snippet PROC
	PROC ${arg('NAME')}
	${ cursor()}
	RET
	ENDP ${arg('NAME')}
# proc
snippet proc
	proc ${arg('name')}
	${ cursor()}
	ret
	endp ${arg('name')}
# MACRO
snippet MACRO
	MACRO ${arg('NAME')}
	${ cursor() }
	ENDM ${arg('NAME')}
# macro
snippet macro
	macro ${arg('name')}
	${ cursor() }
	endm ${arg('name')}
# BU
snippet BU
	PUSH ${arg('AX')}
	${ cursor() }
	POP ${arg('AX')}
# bu
snippet bu
	push ${arg('ax')}
	${ cursor() }
	pop ${arg('ax')}
# DB
snippet DB
	${arg('MyVar')} DB ${arg('100h', 2)}
# db
snippet db
	${arg('myVar')} db ${arg('100h', 2)}
# DW
snippet DW
	${arg('MyVar')} DW ${arg("'VALUE'", 2)}
# dw
snippet dw
	${arg('myVar')} dw ${arg("'value'", 2)}
# ADD3
snippet ADD3
	ADD ${arg('AX')}, ${arg('BX', 2)}
	ADD ${arg('AX')}, ${arg('CX', 3)}
	${ cursor() }
# add3
snippet add3
	add ${arg('ax')}, ${arg('bx', 2)}
	add ${arg('ax')}, ${arg('cx', 3)}
	${ cursor() }
# END
snippet END
	${arg('LABEL')}: ${cursor()}
	END ${arg('LABEL')}
# end
snippet end
	${ arg('label')}: ${cursor()}
	end ${arg('label')}
# LOOP
snippet LOOP
	${arg('LABEL')}: ${ cursor() }
	LOOP ${arg('LABEL')}
# loop
snippet loop
	${ arg('label') }: ${ cursor() }
	loop ${arg('label')}
# LOOPE
snippet LOOPE
	${arg('LABEL')}: ${ cursor() }
	LOOPE ${arg('LABEL')}
# loope
snippet loope
	${arg('label') }: ${ cursor() }
	loope ${arg('label')}
# LOOPZ
snippet LOOPZ
	${ arg('LABEL') }: ${ cursor() }
	LOOPZ ${ arg('LABEL')}
# loopz
snippet loopz
	${arg('label') }: ${ cursor() }
	loopz ${arg('label')}
# LOOPNE
snippet LOOPNE
	${ arg('LABEL') }: ${ cursor() }
	LOOPNE ${arg('LABEL')}
# loopne
snippet loopne
	${ arg('label') }: ${ cursor() }
	loopne ${ arg('label') }
# LOOPNZ
snippet LOOPNZ
	${ arg('LABEL') }: ${ cursor() }
	LOOPNZ ${ arg('LABEL')}
# loopnz
snippet loopnz
	${ arg('label') }: ${ cursor() }
	loopnz ${ arg('label') }
# INT
snippet INT
	MOV ${ arg('AX') }, ${arg('4C00h', 2)}
	INT ${ arg('21h', 3) }
# int
snippet int
	mov ${ arg('ax') }, ${ arg('4c00h', 2) }
	int ${ arg('21h', 3) }
# POPF
snippet POPF
	POPF
	${ cursor() }
# popf
snippet popf
	popf
	${ cursor() }
# PUSHF
snippet PUSHF
	PUSHF
	${ cursor()}
# pushf
snippet pushf
	pushf
	${ cursor() }
# str
snippet str
	${arg('strName')} db '${arg('strValue', 2)}'
	${arg(arg('strName') + 'Length', 3)} equ $-${arg('strName')}
# str;
snippet str;
	${arg('strName')} db '${arg('strValue', 2)}'			  ; Defining a string type variable called "${arg('strName')}"
	${arg(arg('strName') + 'Length', 3)} equ $-${arg('strName')}		; A variable that holds the length of "${arg('strName')}"
# STR
snippet STR
	${arg('STRNAME')} DB '${arg('STRVALUE', 2)}'
	${arg(arg('STRNAME') + 'Length', 3)} EQU $-${arg('STRNAME')}
# STR;
snippet STR;
	${arg('STRNAME')} DB '${arg('STRVALUE', 2)}'			  ; Defining a string type variable called "${arg('STRNAME')}"
	${arg(arg('STRNAME') + 'Length', 3)} EQU $-${arg('STRNAME')}		; A variable that holds the length of "${arg('STRNAME')}"
`;
	addSnippetCommand(exports, 'MOV', 'AX BX');
	addSnippetCommand(exports, 'XCHG', 'AX BX');

	addSnippetCommand(exports, 'ADD', 'AX BX');
	addSnippetCommand(exports, 'ADC', 'AX BX');
	addSnippetCommand(exports, 'SUB', 'AX BX');
	addSnippetCommand(exports, 'SBB', 'AX BX');
	addSnippetCommand(exports, 'CMP', 'AX BX');
	addSnippetCommand(exports, 'INC', 'AX');
	addSnippetCommand(exports, 'DEC', 'AX');
	addSnippetCommand(exports, 'NEG', 'AX');

	addSnippetCommand(exports, 'MUL', 'AX');
	addSnippetCommand(exports, 'DIV', 'AX');
	addSnippetCommand(exports, 'IMUL', 'AX');
	addSnippetCommand(exports, 'IDIV', 'AX');

	addSnippetCommand(exports, 'AND', 'AX BX');
	addSnippetCommand(exports, 'OR', 'AX BX');
	addSnippetCommand(exports, 'TEST', 'AX BX');
	addSnippetCommand(exports, 'XOR', 'AX BX');
	addSnippetCommand(exports, 'NOT', 'AX');

	addSnippetCommand(exports, 'ROR', 'AX CL');
	addSnippetCommand(exports, 'ROL', 'AX CL');
	addSnippetCommand(exports, 'SHR', 'AX CL');
	addSnippetCommand(exports, 'SHL', 'AX CL');

	addSnippetCommand(exports, 'JMP', 'LABEL');
	addSnippetCommand(exports, 'JNC', 'LABEL');
	addSnippetCommand(exports, 'JE', 'LABEL');
	addSnippetCommand(exports, 'JZ', 'LABEL');
	addSnippetCommand(exports, 'JNE', 'LABEL');
	addSnippetCommand(exports, 'JNZ', 'LABEL');
	addSnippetCommand(exports, 'JA', 'LABEL');
	addSnippetCommand(exports, 'JNBE', 'LABEL');
	addSnippetCommand(exports, 'JAE', 'LABEL');
	addSnippetCommand(exports, 'JNB', 'LABEL');
	addSnippetCommand(exports, 'JB', 'LABEL');
	addSnippetCommand(exports, 'JNAE', 'LABEL');
	addSnippetCommand(exports, 'JC', 'LABEL');
	addSnippetCommand(exports, 'JNA', 'LABEL');
	addSnippetCommand(exports, 'JBE', 'LABEL');
	addSnippetCommand(exports, 'JG', 'LABEL');
	addSnippetCommand(exports, 'JNLE', 'LABEL');
	addSnippetCommand(exports, 'JGE', 'LABEL');
	addSnippetCommand(exports, 'JNL', 'LABEL');
	addSnippetCommand(exports, 'JL', 'LABEL');
	addSnippetCommand(exports, 'JNGE', 'LABEL');
	addSnippetCommand(exports, 'JE', 'LABEL');
	addSnippetCommand(exports, 'JNG', 'LABEL');
	addSnippetCommand(exports, 'JO', 'LABEL');
	addSnippetCommand(exports, 'JNO', 'LABEL');
	addSnippetCommand(exports, 'JS', 'LABEL');
	addSnippetCommand(exports, 'JNS', 'LABEL');
	addSnippetCommand(exports, 'JP', 'LABEL');
	addSnippetCommand(exports, 'JPE', 'LABEL');
	addSnippetCommand(exports, 'JPO', 'LABEL');
	addSnippetCommand(exports, 'JNP', 'LABEL');
	addSnippetCommand(exports, 'JCXZ', 'LABEL');

	addSnippetCommand(exports, 'PUSH', 'AX');
	addSnippetCommand(exports, 'POP', 'AX');

	exports.scope = "assembly_x86";
});
ace.require(["ace/snippets/assembly_x86"], m => { if (typeof module == "object" && typeof exports == "object" && module) { module.exports = m }});
function addSnippetCommand(exports, name, regs) {
	addSubSnippetCommand(exports, String(name).toLowerCase(), String(regs).toLowerCase());
	addSubSnippetCommand(exports, String(name).toUpperCase(), String(regs).toUpperCase());
}
function cursor() { return "${0}" }
function arg(name, index = 1) { return "$" + `{${index}:${name}}` }
function addSubSnippetCommand(exports, name, regs) {
	exports.snippetText += `
# ${name}
snippet ${name}
	${name} ${ String(regs).split(' ').map((item, i) => arg(item, i + 1)).join(', ') }
	${ cursor() }`;
};

            