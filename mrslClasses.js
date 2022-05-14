

//-------------------------------------------------------------------------------//


class mrslShader{
    gl;
    shader;
    vertex;
    fragment;
    program;

    constructor(gl,shader){
        this.gl = gl;
        this.shader = shader;

        this.vertex = gl.createShader(gl.VERTEX_SHADER);
        this.fragment = gl.createShader(gl.FRAGMENT_SHADER);
        gl.shaderSource(this.vertex, shader.vertex_string);
	    gl.shaderSource(this.fragment, shader.fragment_string);

        gl.compileShader(this.vertex);
        if (!gl.getShaderParameter(this.vertex, gl.COMPILE_STATUS)) {
            console.error('ERROR compiling vertex shader!', gl.getShaderInfoLog(this.vertex));
            return;
        }
        gl.compileShader(this.fragment);
        if (!gl.getShaderParameter(this.fragment, gl.COMPILE_STATUS)) {
            console.error('ERROR compiling fragment shader!', gl.getShaderInfoLog(this.fragment));
            return;
        }

        this.program = gl.createProgram();
        gl.attachShader(this.program, this.vertex);
        gl.attachShader(this.program, this.fragment);
        gl.linkProgram(this.program);
        if (!gl.getProgramParameter(this.program, gl.LINK_STATUS)) {
            console.error('ERROR linking program!', gl.getProgramInfoLog(this.program));
            return;
        }
        gl.validateProgram(this.program);
        if (!gl.getProgramParameter(this.program, gl.VALIDATE_STATUS)) {
            console.error('ERROR validating program!', gl.getProgramInfoLog(this.program));
            return;
        }

    }

    enableAttrib(){
        //enable all specified vertex attributes
        this.shader.VertexAttributes.forEach((e)=>{
            let location = this.gl.getAttribLocation(this.program,
                e.name      // Name of the variable inside the shader
            );
            this.gl.vertexAttribPointer(
                location,
                e.size,     // Number of elements per attribute
                this.gl[e.type],     // Type of elements
                this.gl[e.normalized],
                e.stride,   // Size of an individual vertex
                e.offset    // Offset from the beginning of a single vertex to this attribute
            );
            this.gl.enableVertexAttribArray(location);
        });
    };

    setUniforms(params){
        //set all uniforms to their equally indexed parameter
        this.shader.Uniforms.forEach((u,i)=>{
            switch(u.type){                 //uniform type
                case MRSL_SHADER_UNIFORM_uniform3fv:
                    this.gl.uniform3fv(
                        this.gl.getUniformLocation(this.program,
                            u.name          //name of the uniform
                        ),
                        params[i]
                    );
                    break;
                case MRSL_SHADER_UNIFORM_matrix4fv:
                    this.gl.uniformMatrix4fv(
                        this.gl.getUniformLocation(this.program,
                            u.name          //name of the uniform
                        ),
                        this.gl.FALSE, params[i]
                    );
                    break;
                default:
                    console.error("mrslShader/ Uniform type unhandled: "+u.type);
                    break;
            }
        });
    };

    execute(params){
        this.enableAttrib();
        this.gl.useProgram(this.program);
        this.setUniforms(params);
    }
}



//-------------------------------------------------------------------------------//










//-------------------------------------------------------------------------------//


class mrslObject{
    type = MRSL_OBJECT_NOTDEFINED;
    params = [];
    //vertices and indices of this object
    vertices = [];
    indices = [];
    //position of object in world frame
    worldMatrix = mat4.create();
    //cameraMatrix * worldMatrix
    screenMatrix = mat4.create();

    constructor(type,params,mat){
        if(type==MRSL_OBJECT_NOTDEFINED) console.error("mrslObject/ Type not defined");
        this.type = type;
        this.params = params;
        if(mat) mat4.copy(this.worldMatrix,mat);

        //create vertices/indices mesh of this object
        type.mesh(this.vertices,this.indices,params);
    }

    //move this object in world frame
    move(mat){
        mat4.copy(this.worldMatrix,mat);
    }
    //compute screenMatrix
    updateCamera(cameraMatrix){
        mat4.multiply(this.screenMatrix, cameraMatrix, this.worldMatrix);
    }


    //mrslShader object used
    shader;
    setup(scene){
        //create buffers
        this.VBO = scene.gl.createBuffer();
        this.EBO = scene.gl.createBuffer();
        this.shader = scene.shaders[this.type.shader.name];
    }
    draw(scene){
        let gl = scene.gl;
        //bind buffers
        gl.bindBuffer(gl.ARRAY_BUFFER, this.VBO);
        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(this.vertices), gl.STATIC_DRAW);
        gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, this.EBO);
        gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(this.indices), gl.STATIC_DRAW);

        this.type.shaderExecute(this.shader, this.params, this.screenMatrix);
        this.type.draw(gl);
    }

}


class mrslHinge{

}
class mrslJoint{

}
class mrslStructure{

}



//-------------------------------------------------------------------------------//













//-------------------------------------------------------------------------------//

class mrslCamera{
    //associated mrslScene
    scene;

    //projection settings
    fov;
    screenRatio;
    nearPlane;
    farPlane;
    projMat = mat4.create();
    updateProj(fov,rat,near,far){
        this.fov = fov; this.screenRatio = rat;
        this.nearPlane = near; this.farPlane = far;
        mat4.perspective(this.projMat, fov, rat, near, far);
    }

    //view
    position = vec3.create(); //position in world frame
    look = vec3.create();    //forward direction in view, with distance, target = position+look
    up = vec3.create();       //up direction in view
    right = vec3.create();    //right direction in view
    viewMat = mat4.create();
    updateView(pos,look,up){
        vec3.copy(this.position,pos);
        vec3.copy(this.look,look);
        vec3.copy(this.up,up);
        vec3.normalize(this.right,vec3.cross(this.right,look,up));
        mat4.lookAt(this.viewMat, pos, vec3.add(vec3.create(),pos,look), up);
    }

    matrix = mat4.create();
    updateMatrix(){mat4.multiply(this.matrix,this.projMat,this.viewMat);}

    constructor(fov, r, n, f){
        this.updateProj(fov, r, n, f);
        this.updateView([0,5,2], [0,-5,0], [0,0,1]);
        this.updateMatrix();
    }


    traslateMagnitude = 1.0;        //mutiplier to traslated distance, given by distance to the target
    //translation starting and ending separately, where dx,dy represent current absolute traslation on the plane
    traslPos = vec3.create();
    traslateStart(){
        this.traslateMagnitude = vec3.length(this.look);
        //save starting values, in case traslate is not going to be called
        vec3.copy(this.traslPos,this.position);
    }
    traslate(dx,dy){
        vec3.scaleAndAdd(this.traslPos, this.position, this.right, dx * this.traslateMagnitude);
        vec3.scaleAndAdd(this.traslPos, this.traslPos, this.up, dy * this.traslateMagnitude);
        let target = vec3.add(vec3.create(), this.traslPos, this.look);
        mat4.lookAt(this.viewMat, this.traslPos, target, this.up);
        this.updateMatrix();
    }
    traslateEnd(){
        vec3.copy(this.position,this.traslPos);
    }
    //translation executed in steps
    traslateStep(dx,dy){
        this.traslateMagnitude = vec3.length(this.look);
        vec3.scaleAndAdd(this.traslPos, this.position, this.right, dx * this.traslateMagnitude);
        vec3.scaleAndAdd(this.traslPos, this.traslPos, this.up, dy * this.traslateMagnitude);
        let target = vec3.add(vec3.create(), this.traslPos, this.look);
        mat4.lookAt(this.viewMat, this.traslPos, target, this.up);
        this.updateMatrix();
        vec3.copy(this.position,this.traslPos);
    }

    //rotation starting and ending separately, where dx,dy represent current absolute traslation around z and horizontal axes
    rotPos = vec3.create();
    rotLook = vec3.create(); rotUp = vec3.create(); rotRight = vec3.create();
    rotMat1 = mat4.create(); rotMat2 = mat4.create();
    rotateStart(){
        //save starting values, in case rotate is not going to be called
        vec3.copy(this.rotPos,this.position);
        vec3.copy(this.rotLook,this.look);
        vec3.copy(this.rotUp,this.up);
        vec3.copy(this.rotRight,this.right);
    }
    rotate(dx,dy){
        mat4.fromRotation(this.rotMat1, dx, [0,0,1]);    //rotation around z
        vec3.transformMat4(this.rotLook,this.look,this.rotMat1);
        vec3.transformMat4(this.rotUp,this.up,this.rotMat1);
        vec3.transformMat4(this.rotRight,this.right,this.rotMat1);
        mat4.fromRotation(this.rotMat2, dy, this.rotRight);  //rotation around horizontal
        vec3.transformMat4(this.rotLook,this.rotLook,this.rotMat2);
        vec3.transformMat4(this.rotUp,this.rotUp,this.rotMat2);
        vec3.transformMat4(this.rotRight,this.rotRight,this.rotMat2);
        //position+look = target = rotPos+rotLook => rotPos = pos+look-rotLook
        let target = vec3.add(vec3.create(),this.position,this.look);
        vec3.subtract(this.rotPos,target,this.rotLook);
        mat4.lookAt(this.viewMat, this.rotPos, target, this.rotUp);
        this.updateMatrix();
    }
    rotateEnd(){
        vec3.copy(this.position,this.rotPos);
        vec3.copy(this.look,this.rotLook);
        vec3.copy(this.up,this.rotUp);
        vec3.copy(this.right,this.rotRight);
    }

    //zoom
    zoomMagToMouse = 0.01;
    zoom(z){
        if(z>30) z=30;
        if(z<-30) z=-30;
        let target = vec3.add(vec3.create(),this.position,this.look);
        vec3.scaleAndAdd(this.look, this.look, this.look, z*this.zoomMagToMouse);
        vec3.subtract(this.position, target, this.look);
        mat4.lookAt(this.viewMat, this.position, target, this.up);
        this.updateMatrix();
    }
}


//-------------------------------------------------------------------------------//


















//-------------------------------------------------------------------------------//

class mrslScene{
    cnv; //html canvas
    //camera object of this scene
    camera;
    
    gl;  //gl context
    //shaders used in this context
    shaders = {};

    //indipendent objects added to the scene
    objects = [];
    //joint structures added to the scene
    structures = [];

    constructor(cnv){
        this.cnv = cnv;
        let gl = cnv.getContext('webgl');
        this.gl = gl;
        
        this.camera = new mrslCamera(1.0, cnv.width/cnv.height, 0.1, 1000.0);

        this.setupEvents();

        if (!gl) {
            alert('Your browser does not support WebGL');
            return;
        }

        gl.clearColor(0.75, 0.85, 0.8, 1.0);
        gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
        gl.enable(gl.DEPTH_TEST);
    }

    appendObject(type,params,matrix){
        this.objects.push(new mrslObject(type,params,matrix));

        //if this scene doesn't have already the required shader setup
        if(!this.shaders[type.shader.name]){
            this.shaders[type.shader.name] = new mrslShader(this.gl,type.shader);
        }
        this.objects[this.objects.length-1].setup(this);
    }


    draw(){
        let gl = this.gl;
        
        gl.clearColor(0.75, 0.85, 0.8, 1.0);
	    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
        
        let a = performance.now()/500;
        this.objects[0].move(mat4.fromRotation(new Float32Array(16),a,[1,1,1]));

        this.objects.forEach((e)=>{
            e.updateCamera(this.camera.matrix);
            e.draw(this);
        });
    }


    //conversions from canvas/page values to 3d scene values
    camera_PXLS_TRASLPLANE = 0.002;   //mouse pixel difference to translation units on the normal plane
    camera_PXLS_SPHEREROT = 0.005;   //mouse pixel difference to angle of rotation of spherical coordinates in radians

    //mouse press events
    canvasMouseFocused = false; //for keyboard inputs, if last click event was on the canvas
    mousePress = false;     //started a mouse press
    mouseBtn = 0;          //0: left click, 1: middle
    mouseX0 = 0; mouseY0 = 0;
    mouseDX = 0; mouseDY = 0;
    setupEvents(){
        //canvas focus event
        document.addEventListener('click', (e)=> this.canvasMouseFocused = (e.target==this.cnv) );

        //mouse events
        this.cnv.addEventListener('mousedown', (e)=>{
            this.mouseBtn = e.button;
            this.mousePress = true;
            this.mouseX0 = e.pageX; this.mouseY0 = e.pageY;
            this.mouseDX, this.mouseDY = 0;
            if(this.mouseBtn==0) this.camera.rotateStart();
            else if(this.mouseBtn==1) this.camera.traslateStart();
        });
        this.cnv.addEventListener('mousemove', (e)=>{
            if(this.mousePress){
                this.mouseDX = e.pageX-this.mouseX0;
                this.mouseDY = e.pageY-this.mouseY0;
                if(this.mouseBtn==0) this.camera.rotate(-this.mouseDX*this.camera_PXLS_SPHEREROT,-this.mouseDY*this.camera_PXLS_SPHEREROT);
                else if(this.mouseBtn==1) this.camera.traslate(-this.mouseDX*this.camera_PXLS_TRASLPLANE,this.mouseDY*this.camera_PXLS_TRASLPLANE);

            }
        })
        this.cnv.addEventListener('mouseup', (e)=>{
            if(this.mouseBtn==0) this.camera.rotateEnd();
            else if(this.mouseBtn==1) this.camera.traslateEnd();
            this.mousePress = false;
        });
        
        this.cnv.addEventListener('wheel', (e)=>{
            e.preventDefault();
            this.camera.zoom(e.deltaY);
        });
        

        //keyboard events
        document.addEventListener('keydown', (e)=>{
            if(this.canvasMouseFocused) {
                if(e.key == "w")      this.camera.traslateStep(0,this.camera_PXLS_TRASLPLANE*10);
                else if(e.key == "s") this.camera.traslateStep(0,-this.camera_PXLS_TRASLPLANE*10); 
                else if(e.key == "a") this.camera.traslateStep(-this.camera_PXLS_TRASLPLANE*10,0); 
                else if(e.key == "d") this.camera.traslateStep(this.camera_PXLS_TRASLPLANE*10,0);
            }
        });
    }
}


//-------------------------------------------------------------------------------//