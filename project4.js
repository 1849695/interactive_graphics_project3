


// This function takes the projection matrix, the translation, and two rotation angles (in radians) as input arguments.
// The two rotations are applied around x and y axes.
// It returns the combined 4x4 transformation matrix as an array in column-major order.
// The given projection matrix is also a 4x4 matrix stored as an array in column-major order.
// You can use the MatrixMult function defined in project4.html to multiply two 4x4 matrices in the same format.

function ColumnMajorOrder(matrix){
	var result = [];
	var rows = matrix.length;
	var columns = matrix[0].length;
	for (var j = 0; j < columns; j++){
		for (var i = 0; i < rows; i++){
			result.push(matrix[i][j]);  
		}
	}

	return result;
}

function GetModelViewProjection(projectionMatrix, translationX, translationY, translationZ, rotationX, rotationY)
{
	// Define translation, rotation X, and rotation Y matrices
	var trans = [
		[1, 0, 0, translationX],
		[0, 1, 0, translationY],
		[0, 0, 1, translationZ],
		[0, 0, 0, 1]
	];
	
	var rotationXMatrix = [
		[1, 0, 0, 0],
		[0, Math.cos(-rotationX), Math.sin(-rotationX), 0],
		[0, -Math.sin(-rotationX), Math.cos(-rotationX), 0], 
		[0, 0, 0, 1]
	];

	var rotationYMatrix = [
		[Math.cos(-rotationY), 0, -Math.sin(-rotationY), 0 ],
		[0, 1, 0, 0],
		[Math.sin(-rotationY), 0, Math.cos(-rotationY), 0 ],
		[0, 0, 0, 1]
	];

	trans = ColumnMajorOrder(trans);
	rotationXMatrix = ColumnMajorOrder(rotationXMatrix);
	rotationYMatrix = ColumnMajorOrder(rotationYMatrix);

	var transf1 = MatrixMult(trans, rotationYMatrix);
	var transf = MatrixMult(transf1, rotationXMatrix);

	// Combine with the projection matrix
	var mvp = MatrixMult(projectionMatrix, transf);
	return mvp;
}


// [TO-DO] Complete the implementation of the following class.

class MeshDrawer
{
	// The constructor is a good place for taking care of the necessary initializations.
	constructor()
	{
		var objFS =  `
	precision mediump float;
	uniform sampler2D sampler;
	varying vec2 fragTexCoord;
	uniform bool useTexture;
	void main()
	{
		if(useTexture && fragTexCoord != vec2(0.0,0.0)){
			gl_FragColor = texture2D(sampler, fragTexCoord);
		}
		else {
			gl_FragColor= vec4(1, gl_FragCoord.z * gl_FragCoord.z, 0, 1);
		}
	}
`	;
		// Compile the shader program
		this.program = InitShaderProgram( objVS, objFS );
		
		// Get the ids of the uniform variables in the shaders
		this.mvp = gl.getUniformLocation( this.program, 'mvp' );
		
		// Get the ids of the vertex attributes in the shaders
		this.vertPos = gl.getAttribLocation( this.program, 'vertPos' );
		this.vertexBuffer = gl.createBuffer();
		this.texturecoorBuffer = gl.createBuffer();
		
		this.texCoordLocation=gl.getAttribLocation(this.program, 'vertTexCoord' );
		this.textureLocation=gl.getAttribLocation(this.program, 'sampler');
		
		gl.useProgram(this.program);
		var useTexture = gl.getUniformLocation(this.program , "useTexture");
		gl.uniform1i( useTexture, true);

	}
	
	// This method is called every time the user opens an OBJ file.
	// The arguments of this function is an array of 3D vertex positions
	// and an array of 2D texture coordinates.
	// Every item in these arrays is a floating point value, representing one
	// coordinate of the vertex position or texture coordinate.
	// Every three consecutive elements in the vertPos array forms one vertex
	// position and every three consecutive vertex positions form a triangle.
	// Similarly, every two consecutive elements in the texCoords array
	// form the texture coordinate of a vertex.
	// Note that this method can be called multiple times.

	setMesh( vertPos, texCoords )
	{
		// [TO-DO] Update the contents of the vertex buffer objects.
		this.numTriangles = vertPos.length / 3;
		
		gl.bindBuffer(gl.ARRAY_BUFFER, this.vertexBuffer);
		gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertPos), gl.STATIC_DRAW );

		gl.bindBuffer(gl.ARRAY_BUFFER, this.texturecoorBuffer);
		gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(texCoords), gl.STATIC_DRAW );
		
	}
	
	// This method is called when the user changes the state of the
	// "Swap Y-Z Axes" checkbox. 
	// The argument is a boolean that indicates if the checkbox is checked.
	swapYZ( swap )
	{
		// [TO-DO] Set the uniform parameter(s) of the vertex shader
		gl.useProgram(this.program);
		var useSwapLocation = gl.getUniformLocation(this.program, "useSwap");
		var useSwap = swap;
		gl.uniform1i (useSwapLocation, useSwap ? 1 : 0);
	
	}
	
	// This method is called to draw the triangular mesh.
	// The argument is the transformation matrix, the same matrix returned
	// by the GetModelViewProjection function above.
	draw( trans )
	{
		// [TO-DO] Complete the WebGL initializations before drawing

		gl.useProgram( this.program );
		gl.uniformMatrix4fv( this.mvp, false, trans );
		gl.bindBuffer( gl.ARRAY_BUFFER, this.vertexBuffer );
		gl.vertexAttribPointer( this.vertPos, 3, gl.FLOAT, false, 0, 0 );
		gl.enableVertexAttribArray( this.vertPos );
	
        
		gl.drawArrays( gl.TRIANGLES, 0, this.numTriangles );
	}
	
	// This method is called to set the texture of the mesh.
	// The argument is an HTML IMG element containing the texture data.
	setTexture(img) {
    
    gl.bindBuffer(gl.ARRAY_BUFFER, this.texturecoorBuffer);
	gl.enableVertexAttribArray(this.texCoordLocation);
    gl.vertexAttribPointer(this.texCoordLocation, 2, gl.FLOAT, false, 0, 0);
        

    var texture = gl.createTexture();
	
	
    gl.activeTexture(gl.TEXTURE0);

    gl.bindTexture(gl.TEXTURE_2D, texture);

    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.REPEAT);
	gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.REPEAT);
	gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
	gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);

    gl.useProgram(this.program);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, img);

    var samplerUniform = gl.getUniformLocation(this.program, 'sampler');

		if (samplerUniform !== null && gl.getParameter(gl.CURRENT_PROGRAM) === this.program) 
		{
        gl.uniform1i(samplerUniform, 0);
		} 
		else 
		{
        console.error('Impossibile trovare l\'uniform sampler nel programma WebGL corrente.');
			}
			
		
	}




	
	// This method is called when the user changes the state of the
	// "Show Texture" checkbox. 
	// The argument is a boolean that indicates if the checkbox is checked.
	showTexture(show) 
	{
	
	gl.useProgram(this.program);
    
    var useTextureLocation = gl.getUniformLocation(this.program, 'useTexture');

    gl.uniform1i(useTextureLocation, show ? 1 : 0);

	}
	
}

var objVS = `
attribute vec3 vertPos;
attribute vec2 vertTexCoord;
uniform mat4 mvp;
varying vec2 fragTexCoord;
uniform bool useSwap;
void main()
{
	mat4 swap_matrix =mat4 ( 
		1, 0, 0, 0,
		0, 0, 1, 0,
		0, 1, 0, 0,
		0, 0, 0, 1);

	if(useSwap){
		gl_Position = mvp * swap_matrix * vec4(vertPos,1);
	}
	else {
		gl_Position = mvp * vec4(vertPos,1);
	}
	
	fragTexCoord = vertTexCoord;
}
`;


