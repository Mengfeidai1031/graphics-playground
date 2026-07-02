using UnityEngine;
using UnityEngine.SceneManagement;
using UnityEngine.UI;
using System.Collections;
using System.Linq;
#if UNITY_EDITOR
using UnityEditor;
using UnityEditor.SceneManagement;
#endif

public class AutoSetup : MonoBehaviour
{
    #if UNITY_EDITOR
    [MenuItem("Game Setup/1. Create All Scenes")]
    public static void CreateAllScenes()
    {
        // Crear carpeta Scenes si no existe
        if (!AssetDatabase.IsValidFolder("Assets/Scenes"))
        {
            AssetDatabase.CreateFolder("Assets", "Scenes");
        }

        // Crear escenas
        CreateScene("CarSelection");
        CreateScene("MainMenu");
        CreateScene("CoinCollection");
        CreateScene("TestTrack");

        Debug.Log("✓ Todas las escenas creadas!");
    }

    static void CreateScene(string sceneName)
    {
        var scene = EditorSceneManager.NewScene(NewSceneSetup.DefaultGameObjects, NewSceneMode.Single);
        EditorSceneManager.SaveScene(scene, $"Assets/Scenes/{sceneName}.unity");
    }

    [MenuItem("Game Setup/2. Find Car Prefabs Automatically")]
    public static void FindCarPrefabs()
    {
        // Buscar todos los modelos de coches en el proyecto
        string[] guids = AssetDatabase.FindAssets("t:GameObject", new[] { "Assets" });
        
        Debug.Log($"Buscando coches en el proyecto...");
        Debug.Log($"Encontrados {guids.Length} GameObjects. Filtrando coches...");
        
        int carCount = 0;
        foreach (string guid in guids)
        {
            string path = AssetDatabase.GUIDToAssetPath(guid);
            GameObject obj = AssetDatabase.LoadAssetAtPath<GameObject>(path);
            
            if (obj != null && IsLikelyCar(obj))
            {
                carCount++;
                Debug.Log($"✓ Coche encontrado: {obj.name} en {path}");
            }
        }
        
        Debug.Log($"Total de coches detectados: {carCount}");
    }

    static bool IsLikelyCar(GameObject obj)
    {
        // Detectar si es un coche basándose en nombre y estructura
        string name = obj.name.ToLower();
        
        if (name.Contains("car") || name.Contains("vehicle") || name.Contains("auto"))
        {
            return true;
        }
        
        // Verificar si tiene hijos que parecen ruedas
        Transform[] children = obj.GetComponentsInChildren<Transform>();
        int wheelCount = 0;
        
        foreach (Transform child in children)
        {
            if (child.name.ToLower().Contains("wheel"))
            {
                wheelCount++;
            }
        }
        
        return wheelCount >= 2;
    }

    [MenuItem("Game Setup/3. Setup Car Selection Scene")]
    public static void SetupCarSelectionScene()
    {
        EditorSceneManager.OpenScene("Assets/Scenes/CarSelection.unity");
        
        // Crear GameManager
        GameObject manager = new GameObject("GameManager");
        manager.AddComponent<CarSelectorAuto>();
        
        // Crear UI automáticamente
        CreateCarSelectionUI();
        
        // Configurar cámara
        Camera.main.transform.position = new Vector3(0, 2, -8);
        Camera.main.transform.rotation = Quaternion.Euler(15, 0, 0);
        Camera.main.backgroundColor = new Color(0.2f, 0.3f, 0.4f);
        
        // Añadir luz
        GameObject light = new GameObject("Directional Light");
        Light lightComp = light.AddComponent<Light>();
        lightComp.type = LightType.Directional;
        light.transform.rotation = Quaternion.Euler(50, -30, 0);
        lightComp.intensity = 1.5f;
        
        EditorSceneManager.SaveScene(SceneManager.GetActiveScene());
        Debug.Log("✓ Escena CarSelection configurada!");
    }

    static void CreateCarSelectionUI()
    {
        // Crear Canvas
        GameObject canvasObj = new GameObject("Canvas");
        Canvas canvas = canvasObj.AddComponent<Canvas>();
        canvas.renderMode = RenderMode.ScreenSpaceOverlay;
        
        CanvasScaler scaler = canvasObj.AddComponent<CanvasScaler>();
        scaler.uiScaleMode = CanvasScaler.ScaleMode.ScaleWithScreenSize;
        scaler.referenceResolution = new Vector2(1920, 1080);
        
        canvasObj.AddComponent<GraphicRaycaster>();
        
        // EventSystem
        GameObject eventSystem = new GameObject("EventSystem");
        eventSystem.AddComponent<UnityEngine.EventSystems.EventSystem>();
        eventSystem.AddComponent<UnityEngine.EventSystems.StandaloneInputModule>();
        
        // Panel de fondo
        CreateUIPanel(canvasObj.transform, "Background", new Color(0.1f, 0.1f, 0.15f, 0.95f));
        
        // Título
        CreateUIText(canvasObj.transform, "TitleText", "SELECCIONA TU COCHE", 
            new Vector2(0, 350), new Vector2(1000, 300), 70, TextAnchor.MiddleCenter);
        
        // Texto del nombre del coche
        GameObject carNameObj = CreateUIText(canvasObj.transform, "CarNameText", "Coche 1", 
            new Vector2(0, -350), new Vector2(600, 100), 50, TextAnchor.MiddleCenter);
        
        // Botones
        CreateUIButton(canvasObj.transform, "LeftButton", "<", 
            new Vector2(-400, 0), new Vector2(120, 120), 60);
        
        CreateUIButton(canvasObj.transform, "RightButton", ">", 
            new Vector2(400, 0), new Vector2(120, 120), 60);
        
        CreateUIButton(canvasObj.transform, "SelectButton", "SELECCIONAR", 
            new Vector2(0, -450), new Vector2(400, 100), 40);
    }

    static GameObject CreateUIPanel(Transform parent, string name, Color color)
    {
        GameObject panel = new GameObject(name);
        panel.transform.SetParent(parent);
        
        RectTransform rect = panel.AddComponent<RectTransform>();
        rect.anchorMin = Vector2.zero;
        rect.anchorMax = Vector2.one;
        rect.sizeDelta = Vector2.zero;
        rect.anchoredPosition = Vector2.zero;
        
        Image image = panel.AddComponent<Image>();
        image.color = color;
        
        return panel;
    }

    static GameObject CreateUIText(Transform parent, string name, string text, 
        Vector2 position, Vector2 size, int fontSize, TextAnchor alignment)
    {
        GameObject textObj = new GameObject(name);
        textObj.transform.SetParent(parent);
        
        RectTransform rect = textObj.AddComponent<RectTransform>();
        rect.anchoredPosition = position;
        rect.sizeDelta = size;
        
        Text textComp = textObj.AddComponent<Text>();
        textComp.text = text;
        textComp.fontSize = fontSize;
        textComp.alignment = alignment;
        textComp.color = Color.white;
        
        return textObj;
    }

    static GameObject CreateUIButton(Transform parent, string name, string text, 
        Vector2 position, Vector2 size, int fontSize)
    {
        GameObject buttonObj = new GameObject(name);
        buttonObj.transform.SetParent(parent);
        
        RectTransform rect = buttonObj.AddComponent<RectTransform>();
        rect.anchoredPosition = position;
        rect.sizeDelta = size;
        
        Image image = buttonObj.AddComponent<Image>();
        image.color = new Color(0.2f, 0.4f, 0.8f);
        
        Button button = buttonObj.AddComponent<Button>();
        
        // Texto del botón
        GameObject textObj = new GameObject("Text");
        textObj.transform.SetParent(buttonObj.transform);
        
        RectTransform textRect = textObj.AddComponent<RectTransform>();
        textRect.anchorMin = Vector2.zero;
        textRect.anchorMax = Vector2.one;
        textRect.sizeDelta = Vector2.zero;
        textRect.anchoredPosition = Vector2.zero;
        
        Text textComp = textObj.AddComponent<Text>();
        textComp.text = text;
        textComp.fontSize = fontSize;
        textComp.alignment = TextAnchor.MiddleCenter;
        textComp.color = Color.white;
        
        return buttonObj;
    }

    [MenuItem("Game Setup/4. Setup Main Menu Scene")]
    public static void SetupMainMenuScene()
    {
        EditorSceneManager.OpenScene("Assets/Scenes/MainMenu.unity");
        
        // Crear GameManager
        GameObject manager = new GameObject("MenuManager");
        manager.AddComponent<MainMenuManagerAuto>();
        
        // Crear UI
        CreateMainMenuUI();
        
        // Luz
        GameObject light = new GameObject("Directional Light");
        Light lightComp = light.AddComponent<Light>();
        lightComp.type = LightType.Directional;
        light.transform.rotation = Quaternion.Euler(50, -30, 0);
        
        EditorSceneManager.SaveScene(SceneManager.GetActiveScene());
        Debug.Log("✓ Escena MainMenu configurada!");
    }

    static void CreateMainMenuUI()
    {
        // Canvas
        GameObject canvasObj = new GameObject("Canvas");
        Canvas canvas = canvasObj.AddComponent<Canvas>();
        canvas.renderMode = RenderMode.ScreenSpaceOverlay;
        
        CanvasScaler scaler = canvasObj.AddComponent<CanvasScaler>();
        scaler.uiScaleMode = CanvasScaler.ScaleMode.ScaleWithScreenSize;
        scaler.referenceResolution = new Vector2(1920, 1080);
        
        canvasObj.AddComponent<GraphicRaycaster>();
        
        // EventSystem
        if (!Object.FindObjectOfType<UnityEngine.EventSystems.EventSystem>())
        {
            GameObject eventSystem = new GameObject("EventSystem");
            eventSystem.AddComponent<UnityEngine.EventSystems.EventSystem>();
            eventSystem.AddComponent<UnityEngine.EventSystems.StandaloneInputModule>();
        }
        
        // Panel de fondo
        CreateUIPanel(canvasObj.transform, "Background", new Color(0.05f, 0.1f, 0.15f, 1f));
        
        // Título
        CreateUIText(canvasObj.transform, "TitleText", "MENÚ PRINCIPAL", 
            new Vector2(0, 300), new Vector2(900, 150), 80, TextAnchor.MiddleCenter);
        
        // Botones
        CreateUIButton(canvasObj.transform, "CoinGameButton", "ATRAPA LAS MONEDAS", 
            new Vector2(0, 50), new Vector2(500, 120), 40);
        
        CreateUIButton(canvasObj.transform, "TestTrackButton", "PRUEBA TU COCHE", 
            new Vector2(0, -120), new Vector2(500, 120), 40);
    }

    [MenuItem("Game Setup/5. Setup Game Scenes (Coin & Test)")]
    public static void SetupGameScenes()
    {
        SetupCoinCollectionScene();
        SetupTestTrackScene();
    }

    static void SetupCoinCollectionScene()
    {
        EditorSceneManager.OpenScene("Assets/Scenes/CoinCollection.unity");
        
        // GameManager
        GameObject manager = new GameObject("GameManager");
        manager.AddComponent<CoinGameManagerAuto>();
        
        // TerrainGenerator
        GameObject terrainGen = new GameObject("TerrainGenerator");
        terrainGen.AddComponent<ProceduralTerrainAuto>();
        
        // CarSpawner
        GameObject carSpawner = new GameObject("CarSpawner");
        carSpawner.AddComponent<CarSpawnerAuto>();
        
        // UI
        CreateCoinGameUI();
        
        // Luz
        GameObject light = new GameObject("Directional Light");
        Light lightComp = light.AddComponent<Light>();
        lightComp.type = LightType.Directional;
        light.transform.rotation = Quaternion.Euler(50, -30, 0);
        lightComp.intensity = 1.2f;
        
        EditorSceneManager.SaveScene(SceneManager.GetActiveScene());
        Debug.Log("✓ Escena CoinCollection configurada!");
    }

    static void CreateCoinGameUI()
    {
        GameObject canvasObj = new GameObject("Canvas");
        Canvas canvas = canvasObj.AddComponent<Canvas>();
        canvas.renderMode = RenderMode.ScreenSpaceOverlay;
        
        CanvasScaler scaler = canvasObj.AddComponent<CanvasScaler>();
        scaler.uiScaleMode = CanvasScaler.ScaleMode.ScaleWithScreenSize;
        scaler.referenceResolution = new Vector2(1920, 1080);
        
        canvasObj.AddComponent<GraphicRaycaster>();
        
        if (!Object.FindObjectOfType<UnityEngine.EventSystems.EventSystem>())
        {
            GameObject eventSystem = new GameObject("EventSystem");
            eventSystem.AddComponent<UnityEngine.EventSystems.EventSystem>();
            eventSystem.AddComponent<UnityEngine.EventSystems.StandaloneInputModule>();
        }
        
        // Textos de juego
        CreateUIText(canvasObj.transform, "CoinText", "Monedas: 0/5", 
            new Vector2(-700, 480), new Vector2(400, 80), 40, TextAnchor.MiddleLeft);
        
        CreateUIText(canvasObj.transform, "TimerText", "Tiempo: 00:00", 
            new Vector2(700, 480), new Vector2(400, 80), 40, TextAnchor.MiddleRight);
        
        // ← AÑADIR BOTÓN SALIR AQUÍ
        GameObject exitButton = CreateUIButton(canvasObj.transform, "ExitButton", "← SALIR", 
            new Vector2(-850, 400), new Vector2(150, 60), 28);

        // Panel de victoria (oculto inicialmente)
        GameObject winPanel = CreateUIPanel(canvasObj.transform, "WinPanel", new Color(0, 0, 0, 0.9f));
        
        CreateUIText(winPanel.transform, "WinText", "¡VICTORIA!", 
            new Vector2(0, 100), new Vector2(600, 100), 70, TextAnchor.MiddleCenter);
        
        CreateUIButton(winPanel.transform, "RestartButton", "REINICIAR", 
            new Vector2(-150, -50), new Vector2(250, 80), 35);
        
        CreateUIButton(winPanel.transform, "MenuButton", "MENÚ", 
            new Vector2(150, -50), new Vector2(250, 80), 35);
        
        winPanel.SetActive(false);
    }

    static void SetupTestTrackScene()
    {
        EditorSceneManager.OpenScene("Assets/Scenes/TestTrack.unity");
        
        // GameManager
        GameObject manager = new GameObject("GameManager");
        manager.AddComponent<TestTrackManagerAuto>();
        
        // CarSpawner
        GameObject carSpawner = new GameObject("CarSpawner");
        carSpawner.AddComponent<CarSpawnerAuto>();
        
        // TrackGenerator
        GameObject trackGen = new GameObject("TrackGenerator");
        trackGen.AddComponent<TrackGeneratorAuto>();
        
        // UI
        CreateTestTrackUI();
        
        // Luz
        GameObject light = new GameObject("Directional Light");
        Light lightComp = light.AddComponent<Light>();
        lightComp.type = LightType.Directional;
        light.transform.rotation = Quaternion.Euler(50, -30, 0);
        
        EditorSceneManager.SaveScene(SceneManager.GetActiveScene());
        Debug.Log("✓ Escena TestTrack configurada!");
    }

    static void CreateTestTrackUI()
    {
        GameObject canvasObj = new GameObject("Canvas");
        Canvas canvas = canvasObj.AddComponent<Canvas>();
        canvas.renderMode = RenderMode.ScreenSpaceOverlay;
        
        CanvasScaler scaler = canvasObj.AddComponent<CanvasScaler>();
        scaler.uiScaleMode = CanvasScaler.ScaleMode.ScaleWithScreenSize;
        scaler.referenceResolution = new Vector2(1920, 1080);
        
        canvasObj.AddComponent<GraphicRaycaster>();
        
        if (!Object.FindObjectOfType<UnityEngine.EventSystems.EventSystem>())
        {
            GameObject eventSystem = new GameObject("EventSystem");
            eventSystem.AddComponent<UnityEngine.EventSystems.EventSystem>();
            eventSystem.AddComponent<UnityEngine.EventSystems.StandaloneInputModule>();
        }
        
        CreateUIText(canvasObj.transform, "LapText", "Vuelta: 1/2", 
            new Vector2(-700, 480), new Vector2(400, 80), 40, TextAnchor.MiddleLeft);
        
        CreateUIText(canvasObj.transform, "TimeText", "Tiempo: 00:00:00", 
            new Vector2(700, 480), new Vector2(500, 80), 40, TextAnchor.MiddleRight);
        
        CreateUIText(canvasObj.transform, "BestTimeText", "Mejor: --:--:--", 
            new Vector2(0, 480), new Vector2(400, 80), 35, TextAnchor.MiddleCenter);

        // ← AÑADIR BOTÓN SALIR AQUÍ
        GameObject exitButton = CreateUIButton(canvasObj.transform, "ExitButton", "← SALIR", 
            new Vector2(-850, 400), new Vector2(150, 60), 28); 

        // Panel de finalización
        GameObject finishPanel = CreateUIPanel(canvasObj.transform, "FinishPanel", new Color(0, 0, 0, 0.9f));
        
        CreateUIText(finishPanel.transform, "FinishText", "¡CARRERA COMPLETADA!", 
            new Vector2(0, 100), new Vector2(800, 100), 60, TextAnchor.MiddleCenter);
        
        CreateUIButton(finishPanel.transform, "RestartButton", "REINICIAR", 
            new Vector2(-150, -50), new Vector2(250, 80), 35);
        
        CreateUIButton(finishPanel.transform, "MenuButton", "MENÚ", 
            new Vector2(150, -50), new Vector2(250, 80), 35);
        
        finishPanel.SetActive(false);
    }

    [MenuItem("Game Setup/6. Add Scenes to Build Settings")]
    public static void AddScenesToBuild()
    {
        var scenes = new[]
        {
            "Assets/Scenes/CarSelection.unity",
            "Assets/Scenes/MainMenu.unity",
            "Assets/Scenes/CoinCollection.unity",
            "Assets/Scenes/TestTrack.unity"
        };
        
        EditorBuildSettings.scenes = scenes.Select(s => new EditorBuildSettingsScene(s, true)).ToArray();
        
        Debug.Log("✓ Escenas añadidas a Build Settings!");
    }
    #endif
}