

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
        //params: origin point, side1 vec, side2 vec, side3 vec, rgb color
        if(params.length==5){
            var x = params[0][0]; var y = params[0][1]; var z = params[0][2];
            //8 vertices given by a all combinations of the 3 vectors
            vertices.push(x,y,z,
                x+params[1][0], y+params[1][1], z+params[1][2],
                x+params[2][0], y+params[2][1], z+params[2][2],
                x+params[3][0], y+params[3][1], z+params[3][2],
                x+params[1][0]+params[2][0], y+params[1][1]+params[2][1], z+params[1][2]+params[2][2],
                x+params[3][0]+params[2][0], y+params[3][1]+params[2][1], z+params[3][2]+params[2][2],
                x+params[1][0]+params[3][0], y+params[1][1]+params[3][1], z+params[1][2]+params[3][2],
                x+params[1][0]+params[2][0]+params[3][0], y+params[1][1]+params[2][1]+params[3][1], z+params[1][2]+params[2][2]+params[3][2]);
            //12 triangle strip, given by 3+11 indices
            indices.push(2,4,0,1,6,4,7,2,5,0,3,6,5,7);
        }
        else console.error("MRSL_OBJECT_PRISM/mesh/ wrong parameter number");
    },

    shader: MRSL_SHADER_XYZ_UNIRGB_UNIMAT,
    shaderExecute: (shader, objParams, objMatrix)=>{
        //uniforms: rgb color, matrix
        shader.execute([objParams[4], objMatrix]);
    },
    draw: (gl)=>{
        //draw the 12 triangles
        gl.drawElements(gl.TRIANGLE_STRIP, 14, gl.UNSIGNED_SHORT, 0);
    }
};

const MRSL_OBJECT_COORDSFRAME = {
    name: "COORDSFRAME",
    mesh: (vertices,indices,params)=>{
        //params: origin point
        if(params.length==1){
            //6 vertices for the 3 segments, each with a point and a color
            var x = params[0][0]; var y = params[0][1]; var z = params[0][2];
            vertices.push(x,y,z,0.8,0,0, x+1,y,z,0.8,0,0, x,y,z,0,0.8,0, x,y+1,z,0,0.8,0, x,y,z,0,0,0.8, x,y,z+1,0,0,0.8);
        }
        else console.error("MRSL_OBJECT_COORDSFRAME/mesh/ wrong parameter number");
    },

    shader: MRSL_SHADER_XYZRGB_UNIMAT,
    shaderExecute: (shader, objParams, objMatrix)=>{
        //uniforms: rgb color, matrix
        shader.execute([objMatrix]);
    },
    draw: (gl)=>{
        //draw the 12 triangles
        gl.drawArrays(gl.LINES, 0, 6);
    }
};