

const MRSL_OBJECT_NOTDEFINED = {
    name: "NOTDEFINED",
};

const MRSL_OBJECT_TRIANGLE = {
    name: "TRIANGLE",
    mesh: (vertices,indices,params)=>{
        //params: vertex1, vertex2, vertex3, rgb color
        if(params.length==4){
            vertices.push(...params[0], ...params[1], ...params[2]);
        }
        else console.error("MRSL_OBJECT_TRIANGLE/mesh/ wrong parameter number");
    },
    shader: MRSL_SHADER_XYZ_UNIRGB_UNIMAT,
    shaderExecute: (shader, objParams, objMatrix)=>{
        //uniforms: rgb color, matrix
        shader.execute([objParams[3], objMatrix]);
    },
    draw: (gl)=>{
        //draw the 3 vertices
        gl.drawArrays(gl.TRIANGLES, 0, 3);
    }
};

const MRSL_OBJECT_PLANE = {
    name: "PLANE",
    mesh: (vertices,indices,params)=>{
        //params: normal vector, origin point, rgb color
        if(params.length==3){
            //normal vector to plane = 1st point
            angle = Math.acos(vec3.dot(params[0],[0,0,1]) /(1+10e-5));
            rotAxis = vec3.create();
            vec3.cross(rotAxis,[0,0,1],params[0]);
            rotMat = mat4.create();
            mat4.fromRotation(rotMat, angle, rotAxis);
            //plane vectors
            planeX = [rotMat[0],rotMat[1],rotMat[2]];
            planeY = [rotMat[4],rotMat[5],rotMat[6]];
            //origin point on plane = 2nd point
            v1 = vec3.clone(params[1]); v2 = vec3.clone(params[1]);
            v3 = vec3.clone(params[1]); v4 = vec3.clone(params[1]);
            vec3.scaleAndAdd(v1,v1,planeX,100); vec3.scaleAndAdd(v1,v1,planeY,100);
            vec3.scaleAndAdd(v2,v2,planeX,-100); vec3.scaleAndAdd(v2,v2,planeY,100);
            vec3.scaleAndAdd(v3,v3,planeX,100); vec3.scaleAndAdd(v3,v3,planeY,-100);
            vec3.scaleAndAdd(v4,v4,planeX,-100); vec3.scaleAndAdd(v4,v4,planeY,-100);
            vertices.push(...params[1], ...v1, ...v2, ...v3, ...v4);
            indices.push(1,0,2, 2,0,4, 4,0,3, 3,0,1);
        }
        else console.error("MRSL_OBJECT_PLANE/mesh/ wrong parameter number");
    },
    shader: MRSL_SHADER_XYZ_UNIRGB_UNIMAT,
    shaderExecute: (shader, objParams, objMatrix)=>{
        //uniforms: rgb color, matrix
        shader.execute([objParams[2], objMatrix]);
    },
    draw: (gl)=>{
        //draw the 4 triangles
        gl.drawElements(gl.TRIANGLES, 12, gl.UNSIGNED_SHORT, 0);
    }
};

const MRSL_OBJECT_PRISM = {
    name: "PRISM",
    mesh: (vertices,indices,params)=>{
        //params: side1 vec, side2 vec, side3 vec, rgb color
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
        else console.error("MRSL_OBJECT_PRISM/mesh/ wrong parameter number");
    },

    shader: MRSL_SHADER_XYZ_UNIRGB_UNIMAT,
    shaderExecute: (shader, objParams, objMatrix)=>{
        //uniforms: rgb color, matrix
        shader.execute([objParams[3], objMatrix]);
    },
    draw: (gl)=>{
        //draw the 12 triangles
        gl.drawElements(gl.TRIANGLES, 36, gl.UNSIGNED_SHORT, 0);
    }
};