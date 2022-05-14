

# Mobile Robot Simulation Library -  Documentation



## Brief Overview
MRSL is used to easily generate and manage graphics related to a Mobile Robot Simulation application on an html canvas, based on the WebGL framework.

Given a canvas, we can create an *mrslScene*, on which we can start to draw objects. This also enables us to have multiple canvases on our page with each an indipendent *mrslScene*.

Given an *mrslScene*, we can append indipendent objects to it, or alternatively append joint structures, which are also entirely implemented in MRSL.

#
## Dependencies
* gl-matrix.js 


#
## MRSL shaders
Objects that configure an *mrslShader* instance. Many are preconfigured, but it is possible to create custom ones.

### Attributes
* `name` ( string )
* `vertex_string` ( string ): vertex shader code
* `fragment_string` ( string ): fragment shader code
* `VertexAttributes` ( Array[Object] ): array of objects that hold information about vertex attributes used in the shaders
    * `name` ( string ): attribute name used in the shader
    * `size` ( uint ): attribute element count (ex. 3 for a vec3)
    * `type` ( string ): name of the gl type of the attribute elements (ex. "FLOAT" for gl.FLOAT)
    * `normalized` ( bool ): if attribute is normalized
    * `stride` ( uint ): size in bytes of an entire vertex
    * `offset` ( uint ): offset from start of vertex buffer (in bytes) to this attribute's first element
* `Uniforms` ( Array[Object] ): array of objects that hold information about uniforms used in the shaders
    * `name` ( string ): uniform name used in the shader
    * `type` ( uint ): mrsl macro that defines what type of uniform it is (ex. uniform3fv, matrix4fv), these are named  "MRSL_SHADER_UNIFORM_" + uniform_type

### Standard shaders
* MRSL_SHADER_XYZRGB_UNIMAT :   3D position and RGB color per vertex, screen matrix uniform
* MRSL_SHADER_XYZ_UNIRGB_UNIMAT :   3D position per vertex, RGB color uniform and screen matrix uniform




#
## mrslShader
This class wraps around an MRSL shader object the *execute* method, to easily take care of all the shader related stuff to draw an object.

### Attributes
* `gl` ( WebGL_context ): gl context of the scene to which this shader belongs
* `shader` ( Object ): MRSL shader object as defined above
* `vertex` ( WebGL shader ): vertex shader
* `fragment` ( WebGL shader ): fragment shader
* `program` ( WebGL program ): WebGL shader program created in constructor

### Methods
    constructor(gl, shader)
* `gl` ( WebGL context)
* `shader` ( Object ): MRSL shader object
* create and compile vertex and fragment shader
* create program and attach the shader to it, link program
    
<br/>
    
    execute(params)
* enable vertex attributes defined in the shader object
* use shader program
* the objects in the `params` argument are used to set (in order) the uniforms defined in the shader object (ex. colours, matrices)



#
## MRSL object type

Objects that configure an *mrslObject* instance. Many are preconfigured, but it is possible to create custom ones.

### Attributes
* `name` ( string ): name of the object type (ex. TRIANGLE, PRISM)
* `mesh` ( function ): takes (in order) vertices array, indices array and a params array. Saves to the arrays the mesh data generated from the parameters for the specific object type
* `shader` ( Object ): MRSL shader object to use
* `shaderExecute` ( function ): takes (in order) an *mrslShader* instance, a params array and a matrix. Calls the instance's execute method with it's (shader type specific) uniform parameters (ex. colours, matrices).<br/>
*mrslObject* instances call this function with their *mrslShader*, params and screenMatrix; between gl buffers allocation and the gl draw call.
* `draw` ( function ): takes a WebGL context and calls on it the (object type specific) gl draw method (ex. gl.drawElements)


### Standard objects
* MRSL_OBJECT_TRIANGLE :   3 vertex points, RGB color
* MRSL_OBJECT_PLANE :   normal vector (unit length), plane point, RGB color
* MRSL_OBJECT_PRISM :   3 vectors (the prism's sides, starting in the origin), RGB color






#
## mrslObject
MRSl object instance in a particular MRSL scene

### Attributes
* `type` ( Object ): MRSL object type
* `params` ( Array ): Parameters required by the MRSL object type
* `vertices` ( Array ): vertices data used in the WebGL VertexBufferObject
* `indices` ( Array ): indices data used in the WebGL ElementBufferObject
* `worldMatrix` ( Mat4 ): World matrix of the object
* `screenMatrix` ( Mat4 ): Final matrix used the in the shaders, Camera matrix multiplied by World matrix
* `shader`( mrslShader ): *mrslShader* of the *mrslScene* in which the object is rendered

### Methods
    
    constructor(type, params, worldMatrix)
* save arguments in the attributes
* type.mesh method computes the vertices and indices arrays of the created instance from the given parameters 

<br/>

    move(worldMatrix)
    updateCamera(cameraMatrix)
* move the object to the new world matrix
* update the screen matrix from the given camera and current world matrices

<br/>

    setup(scene)
* `scene` ( mrslScene ): the scene in which we want to setup/draw the object
* setup WebGL stuff in the scene context for the object (ex. shader, VBO, EBO)

<br/>

    draw(scene)
* bind VBO and EBO of the object
* call draw function of the MRSL object type with the parameters and the current screenMatrix








#
## mrslCamera

### Attributes

* `scene` ( mrslScene ): *mrslScene* instance
* `fov`, `screenRatiuo`, `nearPlane`, `farPlane` ( float ): projection matrix settings
* `projMat` ( Mat4 ): projection matrix
* `position`, `look`, `up`, `right` ( vec3 ): camera position in world frame, look direction (including distance, target point = position + look), up direction, right direction ( = normalize( cross(look, up)) ), which constitute the view matrix
* `viewMat` ( Mat4 ): view matrix
* `matrix` ( Mat4 ): projMat times viewMat (camera matrix)

### Methods

    updateProj(fov, screenRatio, nearPlane, farPlane)
    updateView(position, look, up)
    updateMatrix()
* save the arguments in the attributes and compute the projection/view/camera matrix






#
## mrslScene
Scene class, manages all the drawing and camera work for a specific WebGL context

### Attributes
* `cnv` ( html canvas )
* `gl` ( WebGL context ): gl context of the canvas
* `camera` ( mrslCamera )
* `shaders` ( Object ): Object containing the *mrslShader* instances (listed by name) used in the scene
* `objects` ( Array[mrslObject] ): Array of the indipendent *mrslObject*s added
* `structures` ( Array[mrslStructure] ): Array of *mrslStructure*s added

### Methods
    constructor(cnv)
* saves cnv attribute and gets WebGL context, sets plain background color and enables DEPTH_TEST
* create camera object related to the scene with default starting parameters
* setup events on the html canvas (propagating keyboard presses and mouse events to the camera object for camera control)

<br/>

    appendObject(type, params, matrix)
* create new *mrslObject* instance with given arguments and push it to the scene objects
* if necessary, create new *mrslShader* instance (specified by the object type) and add it to the scene shaders object
* call setup method on the created object

<br/>

    draw()
* Clears WebGL background color
* Calls on every indipendent object the updateCamera (with current camera matrix) and draw methods


#
## mrslHinge

#
## mrslJoint

#
## mrslStructure






<br/>

#
### 21.04.2022 - Antonio Pisanello, Marco Belli, David Ötterli