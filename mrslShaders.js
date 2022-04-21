


const MRSL_SHADER_UNIFORM_uniform3fv = 3001;
const MRSL_SHADER_UNIFORM_matrix4fv = 3002;

//const MRSL_SHADERS = {

    //3DxRGB vertices, 1 matrix uniform
const MRSL_SHADER_XYZRGB_UNIMAT = {
            name: "XYZRGB_UNIMAT",
            vertex_string: [
                'precision mediump float;',
                '',
                'attribute vec3 vertPosition;',
                'attribute vec3 vertColor;',
                'varying vec3 fragColor;',
                'uniform mat4 matrix;',
                '',
                'void main()',
                '{',
                '  fragColor = vertColor;',
                '  gl_Position = matrix * vec4(vertPosition, 1.0);',
                '}'
            ].join('\n'),
            fragment_string: [
                'precision mediump float;',
                '',
                'varying vec3 fragColor;',
                'void main()',
                '{',
                '  gl_FragColor = vec4(fragColor, 1.0);',
                '}'
            ].join('\n'),
            VertexAttributes: [
                {
                    name: 'vertPosition',
                    size: 3,
                    type: "FLOAT",
                    normalized: false,
                    stride: 6 * Float32Array.BYTES_PER_ELEMENT,
                    offset: 0
                },
                {
                    name: 'vertColor',
                    size: 3,
                    type: "FLOAT",
                    normalized: false,
                    stride: 6 * Float32Array.BYTES_PER_ELEMENT,
                    offset: 3 * Float32Array.BYTES_PER_ELEMENT
                }
            ],
            Uniforms: [
                {
                    name: 'matrix',
                    type: MRSL_SHADER_UNIFORM_matrix4fv
                }
            ]
};

    //3D vertices, RGB uniform, 1 matrix uniform
const MRSL_SHADER_XYZ_UNIRGB_UNIMAT = {
            name: "XYZ_UNIRGB_UNIMAT",
            vertex_string: [
                'precision mediump float;',
                '',
                'attribute vec3 vertPosition;',
                'uniform mat4 matrix;',
                '',
                'void main()',
                '{',
                '  gl_Position = matrix * vec4(vertPosition, 1.0);',
                '}'
            ].join('\n'),
            fragment_string: [
                'precision mediump float;',
                '',
                'uniform vec3 fragColor;',
                'void main()',
                '{',
                '  gl_FragColor = vec4(fragColor, 1.0);',
                '}'
            ].join('\n'),
            VertexAttributes: [
                {
                    name: 'vertPosition',
                    size: 3,
                    type: "FLOAT",
                    normalized: "FALSE",
                    stride: 3 * Float32Array.BYTES_PER_ELEMENT,
                    offset: 0
                }
            ],
            Uniforms: [
                {
                    name: 'fragColor',
                    type: MRSL_SHADER_UNIFORM_uniform3fv
                },
                {
                    name: 'matrix',
                    type: MRSL_SHADER_UNIFORM_matrix4fv
                }
            ]
};