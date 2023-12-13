'use strict';

    import * as THREE from "three";
    import { OrbitControls } from "three/addons/controls/OrbitControls.js";
    import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
    import { RGBELoader } from "three/addons/loaders/RGBELoader";
    import { EffectComposer } from 'three/addons/postprocessing/EffectComposer.js';
    import { RenderPass } from 'three/addons/postprocessing/RenderPass.js';
    import { ShaderPass } from 'three/addons/postprocessing/ShaderPass.js';
    import { CopyShader } from 'three/addons/shaders/CopyShader.js';
    import { HalftonePass } from 'three/addons/postprocessing/HalftonePass.js';
    import { OutputPass } from 'three/addons/postprocessing/OutputPass.js';
    import { BloomPass } from 'three/addons/postprocessing/BloomPass.js';
{
    
    // サイズ指定
    const width = 1920;
    const height = 1080;
    
    // // 初期化のために実行
    // onResize();
    // // リサイズイベント発生時に実行
    // window.addEventListener('resize', onResize);
    
    // function onResize() {
    //   // サイズを取得
    //   const width = window.innerWidth;
    //   const height = window.innerHeight;
    
    // }
    
            // レンダリング
            // レンダラー作成
            
            const canvasElement = document.querySelector("#myCanvas");
            const renderer = new THREE.WebGLRenderer({
                canvas: canvasElement,
                antialias: false, 

              });
        
            renderer.setPixelRatio(window.devicePixelRatio);
            renderer.setSize(width, height);
            renderer.toneMapping = THREE.CineonToneMapping;
            renderer.toneMappingExposure = 0.9;
            renderer.clearDepth(true);
    
            renderer.outputEncoding = THREE.sRGBEncoding;
            renderer.setClearColor(0xEBEBEB, 0)
            renderer.shadowMap.enabled = true;
        
        
            // シーン作成
            const scene = new THREE.Scene();
    
            // カメラ作成
            const camera = new THREE.PerspectiveCamera(45, width/height);
            camera.position.set(60,40, 300);
            camera.rotation.set(0.1, 0.2, 0);
            camera.rotation.x = 0;
            
            // 環境テクスチャ
            new RGBELoader ().load('./assets/images/1k.hdr', function (texture) {
                texture.mapping = THREE.EquirectangularReflectionMapping;
                texture.opacity = 0.1;
                //scene.background = texture;
                scene.environment = texture; // 解像度の低いテクスチャを使用
            })
    
    
            // GLSLローダー
            const loader = new GLTFLoader();
            const clock = new THREE.Clock();
    
            const planeGeo = new THREE.PlaneGeometry(1000, 1000, 100, 10);
            const planeMaterial = new THREE.MeshStandardMaterial({color: 0xfffffff, roughness:0.5});
            const plane = new THREE.Mesh(planeGeo, planeMaterial)
            plane.rotation.set(-Math.PI/2, 0, 0);
            plane.position.set(0, -40, 90);
            plane.receiveShadow = true;
            plane.castShadow = true;
    
    
    
            // 時間追跡
            loader.load(
                './assets/models/myRoom.glb', 
                function (gltf) {
                    let mixer = new THREE.AnimationMixer(gltf.scene);
                    gltf.animations.forEach((clip) => {
                        mixer.clipAction(clip).play();
                    });
    
                    scene.add(gltf.scene);
    
                    // 回転するループアニメーションの実装
                    
                    var rotationKeyframeTrackJSON = {
                        name: ".rotation[y]",
                        type: "number",
                        times: [0, 2, 4, 6],
                        values: [0, 0.06*Math.PI, -0.06*Math.PI, 0],
                        interpolation: THREE.InterpolateSmooth
                    }
    
                    var clipJSON = {
                        duration: 6,
                        tracks: [
                            rotationKeyframeTrackJSON
                        ]
                    }
                    
                    var clip = THREE.AnimationClip.parse(clipJSON)
                    var action = mixer.clipAction(clip)
                    action.play()
    
                    function update() {
                        if (mixer) {
                            mixer.update(clock.getDelta());
                        }
                    }
    
                    const model = gltf.scene; // THREE.Group
                    model.position.set(0, 0, 0);
                    model.scale.set(50, 50, 50);
                    gltf.scenes; // Array<THREE.Group>
                    gltf.cameras; // Array<THREE.Camera>
                    gltf.asset; // Object
    
    
                    // アニメーションを再生するイベントを設定する
                    renderer.setAnimationLoop(() => {
                        update();
                        // renderer.render(scene, camera);
                    });
    
                    model.traverse((obj) => {
    
    
                        if(obj.type === "Mesh") {
                            obj.receiveShadow = true;
                            obj.castShadow = true;
                          } else if (obj.type === 'DirectionalLight') {
                            obj.castShadow = true;
                          }
    

                        //   顔のボーンを操作する
                          if(obj.name === "Bone003") {
                            // 顔の部分だけ動かす
                            // カーソルの移動量取得
                            let prevX = 0;
                            let prevY = 0;
                            window.addEventListener('mousemove', (e)=>{
       
                                let X = (e.clientX-window.innerWidth/2)/window.innerWidth * 2;
                                let Y = (e.clientY-window.innerHeight/2)/window.innerHeight * 2;
    
                                    obj.rotation.z += Math.PI*(X - prevX)*0.036;
                                    model.rotation.y += Math.PI*(X - prevX)*0.06;
                                    prevX = X;
    
                                    obj.rotation.x += Math.PI*(Y - prevY)*0.027;
                                    prevY = Y;
    
                            })

                          }
    
                    })
    
                },
                // called while loading is progressing
                function ( xhr ) {
                    console.log( ( xhr.loaded / xhr.total * 100 ) + '% loaded' );
                },
                // called when loading has errors
                function ( error ) {
                    console.log( 'An error happened' );
                }
            )
    
            // ポストプロセッシング用
    
            const composer = new EffectComposer( renderer );
    
            // レンダーパスを生成
            const renderPass = new RenderPass( scene, camera );
            composer.addPass( renderPass );
    
            animate();
        
        function animate() {
            renderer.clear();
            requestAnimationFrame( animate );
            composer.render();
        };

}    
{
            // レンダリング
            // レンダラー作成
            const height =500;
            const width = 500;
            const canvasElement = document.querySelector("#prof");
            const renderer = new THREE.WebGLRenderer({
                canvas: canvasElement,

              });
        
            renderer.setPixelRatio(window.devicePixelRatio);
            renderer.setSize(width, height);
            renderer.toneMapping = THREE.CineonToneMapping;
            renderer.toneMappingExposure = 0.9;
            renderer.clearDepth(true);
    
            renderer.outputEncoding = THREE.sRGBEncoding;
            renderer.setClearColor(0xEBEBEB, 0)
            renderer.shadowMap.enabled = true;
        
        
            // シーン作成
            const scene = new THREE.Scene();
    
            // カメラ作成
            const camera = new THREE.PerspectiveCamera(45, width/height);
            camera.position.set(60,40, 300);
            camera.rotation.set(0.1, 0.2, 0);
            camera.rotation.x = 0;
            
            // 環境テクスチャ
            new RGBELoader ().load('./assets/images/1k.hdr', function (texture) {
                texture.mapping = THREE.EquirectangularReflectionMapping;
                texture.opacity = 0.1;
                //scene.background = texture;
                scene.environment = texture; // 解像度の低いテクスチャを使用
            })
    
            const light = new THREE.DirectionalLight(0xffffff, 2);
            light.castShadow = false;

    
            // GLSLローダー
            const loader = new GLTFLoader();
            const clock = new THREE.Clock();
    
            const planeGeo = new THREE.PlaneGeometry(1000, 1000, 100, 10);
            const planeMaterial = new THREE.MeshStandardMaterial({color: 0xfffffff, roughness:0.5});
            const plane = new THREE.Mesh(planeGeo, planeMaterial)
            plane.rotation.set(-Math.PI/2, 0, 0);
            plane.position.set(0, -40, 90);
            plane.receiveShadow = true;
            plane.castShadow = true;
    
    
    
            // 時間追跡
            loader.load(
                './assets/models/myRoom.glb', 
                function (gltf) {
                    let mixer = new THREE.AnimationMixer(gltf.scene);
                    gltf.animations.forEach((clip) => {
                        mixer.clipAction(clip).play();
                    });
    
                    scene.add(gltf.scene);
    
                    // 回転するループアニメーションの実装
                    
                    var rotationKeyframeTrackJSON = {
                        name: ".rotation[y]",
                        type: "number",
                        times: [0, 3, 6],
                        values: [0.2, 0, 0.2],
                        interpolation: THREE.InterpolateSmooth
                    }
    
                    var clipJSON = {
                        duration: 6,
                        tracks: [
                            rotationKeyframeTrackJSON
                        ]
                    }
                    
                    var clip = THREE.AnimationClip.parse(clipJSON)
                    var action = mixer.clipAction(clip)
                    action.play()
    
                    function update() {
                        if (mixer) {
                            mixer.update(clock.getDelta());
                        }
                    }
    
                    const model = gltf.scene; // THREE.Group
                    model.position.set(0, 0, 0);
                    model.scale.set(50, 50, 50);
                    gltf.scenes; // Array<THREE.Group>
                    gltf.cameras; // Array<THREE.Camera>
                    gltf.asset; // Object
    
                    model.traverse((obj) => {
    
    
                        if(obj.type === "Mesh") {
                            obj.receiveShadow = true;
                            obj.castShadow = true;
                          } else if (obj.type === 'DirectionalLight') {
                            obj.castShadow = true;
                          }
    
    
                        //   顔のボーンを操作する
                          if(obj.name === "Bone003") {
                            // 顔の部分だけ動かす
                            // カーソルの移動量取得
                            let prevX = 0;
                            let prevY = 0;
                            window.addEventListener('mousemove', (e)=>{
       
                                let X = (e.clientX-window.innerWidth/2)/window.innerWidth * 2;
                                let Y = (e.clientY-window.innerHeight/2)/window.innerHeight * 2;
    
                                    obj.rotation.z += Math.PI*(X - prevX)*0.036;
                                    model.rotation.y += Math.PI*(X - prevX)*0.06;
                                    prevX = X;
    
                                    obj.rotation.x += Math.PI*(Y - prevY)*0.027;
                                    prevY = Y;
    
                            })
                          }
    
                    })
    
    
                    // アニメーションを再生するイベントを設定する
                    renderer.setAnimationLoop(() => {
                        update();
                        // renderer.render(scene, camera);
                    });

    
                },
                // called while loading is progressing
                function ( xhr ) {
                    console.log( ( xhr.loaded / xhr.total * 100 ) + '% loaded' );
                },
                // called when loading has errors
                function ( error ) {
                    console.log( 'An error happened' );
                }
            )
    
            // ポストプロセッシング用
    
            const composer = new EffectComposer( renderer );
    
            // レンダーパスを生成
            const renderPass = new RenderPass( scene, camera );
            composer.addPass( renderPass );
    
            animate();
        
        function animate() {
            renderer.clear();
            requestAnimationFrame( animate );
            composer.render();
        };
}



