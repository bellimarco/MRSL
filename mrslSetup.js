
const { vec3, mat3, mat4 } = glMatrix;


function mrslSetup(){

}


function mrslAddWorldStage(scene){
    scene.appendObject(MRSL_OBJECT_PLANE,[[0,0,1],[0,0,0],[0.65,0.65,0.65]]);
    scene.appendObject(MRSL_OBJECT_COORDSFRAME,[[1,1,1]]);
}