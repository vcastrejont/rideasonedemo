# -*- mode: ruby -*-
# vi: set ft=ruby :

Vagrant.configure(2) do |config|
	config.vm.box = "trusty64"
	config.vm.box_url = "https://cloud-images.ubuntu.com/vagrant/trusty/current/trusty-server-cloudimg-amd64-vagrant-disk1.box"

	config.vm.network "forwarded_port", guest: 3000, host: 3000
	config.vm.network "forwarded_port", guest: 27017, host: 27017

	config.vm.provider "virtualbox" do |vb|
		vb.name = "carpoolingapp"
		vb.memory = 1536
		vb.cpus = 2

		vb.customize ["modifyvm", :id, "--natdnshostresolver1", "on"]
		vb.customize ["modifyvm", :id, "--natdnsproxy1", "on"]
	end

	config.vm.provision "puppet" do |puppet|
		puppet.manifests_path = "__provision__/manifests"
		puppet.manifest_file  = "default.pp"
		puppet.module_path = "__provision__/modules"
	end
end
