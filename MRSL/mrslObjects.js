

const MRSL_OBJECT_NOTDEFINED = {
    name: "NOTDEFINED",
};

const MRSL_OBJECT_TRIANGLE = {
    name: "TRIANGLE",
    mesh: (vertices,indices,params)=>{
        //3 points, 1 color
        if(params.length==4){
            //3 points are the 3 vertices
            vertices.push(...params[0], ...params[1], ...params[2]);
        }
    },
    shader: MRSL_SHADER_XYZ_UNIRGB_UNIMAT,
    shaderExecute: (shader, objParams, objMatrix)=>{
        shader.execute([objParams[3], objMatrix]);
    },
    draw: (gl)=>{
        //draw the 3 vertices
        gl.drawArrays(gl.TRIANGLES, 0, 3);
    }
};

const MRSL_OBJECT_PRISM = {
    name: "PRISM",
    mesh: (vertices,indices,params)=>{
        //3 vectors, 1 color
        if(params.length==4){
            //8 vertices given by a all combinations of the 3 vectors
            vertices.push(0,0,0,
                ...params[0], ...params[1], ...params[2],
                params[0][0]+params[1][0], params[0][1]+params[1][1], params[0][2]+params[1][2],
                params[2][0]+params[1][0], params[2][1]+params[1][1], params[2][2]+params[1][2],
                params[0][0]+params[2][0], params[0][1]+params[2][1], params[0][2]+params[2][2],
                params[0][0]+params[1][0]+params[2][0], params[0][1]+params[1][1]+params[2][1], params[0][2]+params[1][2]+params[2][2]);
            //12 triangles, given by 36 indices
            indices.push(
                0,1,3, 1,3,6,
                0,2,3, 2,3,5,
                1,4,6, 4,6,7,
                4,2,7, 2,7,5,
                3,6,5, 5,6,7,
                0,1,2, 1,2,4
            );
        }
    },

    shader: MRSL_SHADER_XYZ_UNIRGB_UNIMAT,
    shaderExecute: (shader, objParams, objMatrix)=>{
        shader.execute([objParams[3], objMatrix]);
    },
    draw: (gl)=>{
        //draw the 12 triangles
        gl.drawElements(gl.TRIANGLES, 36, gl.UNSIGNED_SHORT, 0);
    }
};