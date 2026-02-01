local RESOURCE = GetCurrentResourceName()

local uiOpen = false

local settings = {
    pedDensity = 1.0,
    scenarioDensity = 1.0,
    lodScale = 1.0,
    disableDecals = 0.0,
    disableScreenBlur = 0.0,
    artificialLightsOff = 0.0,
}

local DEFAULTS = {
    pedDensity = 1.0,
    scenarioDensity = 1.0,
    lodScale = 1.0,
    disableDecals = 0.0,
    disableScreenBlur = 0.0,
    artificialLightsOff = 0.0,
}

local function safeNativeCall(fn, ...)
    if type(fn) ~= 'function' then return false end
    local ok = pcall(fn, ...)
    return ok
end

local function kvpKey(k) return ('ipp_%s'):format(k) end

local function loadSettings()
    for k,_ in pairs(settings) do
        local v = GetResourceKvpString(kvpKey(k))
        if v ~= nil and v ~= '' then
            local n = tonumber(v)
            if n ~= nil then
                settings[k] = n
            end
        end
    end
end

local function saveSettings()
    for k,v in pairs(settings) do
        SetResourceKvp(kvpKey(k), tostring(v))
    end
end

local function pushStateToUI()
    if not uiOpen then return end
    SendNUIMessage({ action = 'state', state = settings })
end

local function pushDeltaToUI(key, value)
    if not uiOpen then return end
    SendNUIMessage({ action = 'delta', key = key, value = value })
end

local function setUiVisible(show)
    uiOpen = show
    if show then
        SetNuiFocus(true, true)
        SendNUIMessage({ show = true, action = 'show' })
        SendNUIMessage({ action = 'state', state = settings })
    else
        SetNuiFocus(false, false)
        SendNUIMessage({ show = false, action = 'hide' })
    end
end

RegisterCommand('+immperfpanel', function()
    setUiVisible(not uiOpen)
end, false)

RegisterCommand('-immperfpanel', function() end, false)

RegisterKeyMapping('+immperfpanel', 'Immersive Performance Panel', 'keyboard', 'F10')

RegisterNUICallback('close', function(_, cb)
    setUiVisible(false)
    if cb then cb({ ok = true }) end
end)

RegisterNUICallback('set', function(data, cb)
    if type(data) ~= 'table' then
        if cb then cb({ ok = false }) end
        return
    end

    local key = data.key
    local value = tonumber(data.value)

    if type(key) ~= 'string' or value == nil or settings[key] == nil then
        if cb then cb({ ok = false }) end
        return
    end

    if key == 'lodScale' then
        if value < 0.1 then value = 0.1 end
        if value > 1.0 then value = 1.0 end
    else
        if value < 0.0 then value = 0.0 end
        if value > 1.0 then value = 1.0 end
    end

    settings[key] = value
    saveSettings()
    pushDeltaToUI(key, value)

    if cb then cb({ ok = true }) end
end)

RegisterNUICallback('restore', function(_, cb)
    for k,v in pairs(DEFAULTS) do
        settings[k] = v
    end
    saveSettings()
    pushStateToUI()
    if cb then cb({ ok = true }) end
end)

CreateThread(function()
    local window = 60
    local dts = {}
    local idx = 1
    local count = 0
    local sum = 0.0
    local lastSend = GetGameTimer()

    while true do
        if not uiOpen then
            Wait(250)
            dts = {}
            idx = 1
            count = 0
            sum = 0.0
            lastSend = GetGameTimer()
        else
            Wait(0)

            local dt = GetFrameTime()
            if dt and dt > 0.0 then
                local old = dts[idx]
                if old then sum = sum - old end
                dts[idx] = dt
                sum = sum + dt

                idx = idx + 1
                if idx > window then idx = 1 end
                if count < window then count = count + 1 end
            end

            local now = GetGameTimer()
            if now - lastSend >= 500 then
                lastSend = now
                local avgDt = (count > 0) and (sum / count) or 0.0
                local fps = 0
                if avgDt > 0.0 then
                    fps = math.floor((1.0 / avgDt) + 0.5)
                end
                if fps < 0 then fps = 0 end
                if fps > 999 then fps = 999 end
                SendNUIMessage({ action = 'fps', value = fps })
            end
        end
    end
end)

CreateThread(function()
    loadSettings()

    local lastArtificial = nil

    while true do
        SetPedDensityMultiplierThisFrame(settings.pedDensity)
        SetScenarioPedDensityMultiplierThisFrame(settings.scenarioDensity, settings.scenarioDensity)

        safeNativeCall(SetLodScale, settings.lodScale)

        if settings.disableDecals >= 0.5 then
            safeNativeCall(SetDisableDecalRenderingThisFrame)
        end

        safeNativeCall(SetDisableScreenBlur, settings.disableScreenBlur >= 0.5)

        local wantArtificialOff = (settings.artificialLightsOff >= 0.5)
        if lastArtificial == nil or lastArtificial ~= wantArtificialOff then
            lastArtificial = wantArtificialOff
            safeNativeCall(SetArtificialLightsState, wantArtificialOff)
        end

        Wait(0)
    end
end)

AddEventHandler('onResourceStop', function(res)
    if res ~= RESOURCE then return end
    uiOpen = false
    SetNuiFocus(false, false)
    SendNUIMessage({ show = false, action = 'hide' })
    safeNativeCall(SetLodScale, 1.0)
    safeNativeCall(SetDisableScreenBlur, false)
    safeNativeCall(SetArtificialLightsState, false)
end)

AddEventHandler('onClientResourceStart', function(res)
    if res ~= RESOURCE then return end
    uiOpen = false
    SetNuiFocus(false, false)
    SendNUIMessage({ show = false, action = 'hide' })
end)
