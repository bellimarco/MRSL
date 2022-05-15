
const { vec3, mat3, mat4 } = glMatrix;


function mrslSetup(){

}


function mrslAddWorldStage(scene){
    scene.appendObject(MRSL_OBJECT_PLANE,[[0,0,1],[0,0,0],[0.65,0.65,0.65]]);
    scene.appendObject(MRSL_OBJECT_COORDSFRAME,[[0,0,0.001]]);

    //grid covering 100x100 plane on origin
    for(let i=0; i<100; i+=10){
        scene.appendObject(MRSL_OBJECT_LINE,[[i,-100,0.002],[i,100,0.002],[0,0,0]]);
        scene.appendObject(MRSL_OBJECT_LINE,[[-i,-100,0.002],[-i,100,0.002],[0,0,0]]);
        scene.appendObject(MRSL_OBJECT_LINE,[[-100,i,0.002],[100,i,0.002],[0,0,0]]);
        scene.appendObject(MRSL_OBJECT_LINE,[[-100,-i,0.002],[100,-i,0.002],[0,0,0]]);
    }
}